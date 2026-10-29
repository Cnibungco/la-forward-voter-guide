import fs from 'node:fs'
import path from 'node:path'

import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import {point} from '@turf/helpers'
import type {Feature, FeatureCollection, MultiPolygon, Polygon} from 'geojson'
import {NextResponse} from 'next/server'

import {censusMatchConfirmsHouseNumber, isIncompleteAddress} from '@/lib/geoapifyAddress'
import type {MatchBallotResult} from '@/lib/types'
import {slugifyPlaceName} from '@/lib/districtMatching'
import {geographiesCooldown} from '@/lib/geographiesCooldown'

/**
 * Address-based ballot matching. See docs/address-matching-strategy.md for
 * the decision doc and docs/backend-strategy.md §12 for the architecture.
 *
 * This is the one deliberate exception to the app's fully-static/ISR
 * model (see `.cursor/rules/data-fetching.mdc`) — Census's Geocoder has no
 * CORS support, so it can only be called server-side.
 *
 * Census's `geographies` service (address → coordinates + districts in one
 * call) goes down on its own while `locations` (address → coordinates) and
 * TIGERweb (coordinates → districts) stay up — seen 2026-10-28. When the
 * first call times out or answers 5xx, the route falls back to those two
 * and skips `geographies` for the next minute (see geographiesCooldown).
 * Both are Census services and return the same layer names and fields, so
 * everything after the lookup is shared.
 *
 * Privacy: the submitted address, and the point it geocodes to, are sent
 * only to the Census calls below and are never persisted, logged, or echoed
 * into an analytics event — including on error. Do not add a
 * `console.error(err)` here that could capture the request body; log only
 * `error.name`/timestamp.
 */

const CENSUS_GEOGRAPHIES_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress'
const CENSUS_LOCATIONS_URL = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
const TIGERWEB_IDENTIFY_URL =
  'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/identify'

// Short enough that a stalled `geographies` call (it 502s after ~10s when
// down) leaves time for the fallback. Normal responses take under a second.
const GEOGRAPHIES_TIMEOUT_MS = 4000
const FALLBACK_TIMEOUT_MS = 2500

// LA County's own GEOID (state 06 = California, county 037 = LA County).
const LA_COUNTY_GEOID = '06037'

/**
 * Boundary layers we resolve locally via point-in-polygon, keyed by the
 * district-code prefix they produce (see docs/backend-strategy.md §12's
 * convention). `county` applies to every LA County address; `cities` is
 * keyed by the matched city's slug — add an entry here (plus a GeoJSON
 * file in data/boundaries/) to extend precise matching to another city,
 * per data/boundaries/README.md.
 */
const COUNTY_SUPERVISORIAL_LAYER = {
  file: 'county-supervisorial-districts.geojson',
  prefix: 'SUP',
  property: 'DISTRICT',
}

const CITY_COUNCIL_LAYERS: Record<string, {file: string; prefix: string; property: string}> = {
  'los-angeles': {
    file: 'la-city-council-districts.geojson',
    prefix: 'CC',
    property: 'District',
  },
  alhambra: {
    file: 'alhambra-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  carson: {
    file: 'carson-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  claremont: {
    file: 'claremont-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  covina: {
    file: 'covina-council-districts.geojson',
    prefix: 'CC',
    property: 'District',
  },
  duarte: {
    file: 'duarte-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  glendora: {
    file: 'glendora-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  inglewood: {
    file: 'inglewood-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  lakewood: {
    file: 'lakewood-council-districts.geojson',
    prefix: 'CC',
    property: 'COUNCIL_DISTRICT_NO',
  },
  'monterey-park': {
    file: 'monterey-park-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  pasadena: {
    file: 'pasadena-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  pomona: {
    file: 'pomona-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  'south-pasadena': {
    file: 'south-pasadena-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  torrance: {
    file: 'torrance-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  'west-covina': {
    file: 'west-covina-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
}

type BoundaryLayer = {file: string; prefix: string; property: string}
type LoadedLayer = FeatureCollection<Polygon | MultiPolygon>

const boundaryCache = new Map<string, LoadedLayer>()

function loadBoundaryLayer(fileName: string): LoadedLayer {
  const cached = boundaryCache.get(fileName)
  if (cached) return cached
  const filePath = path.join(process.cwd(), 'data', 'boundaries', fileName)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw) as LoadedLayer
  boundaryCache.set(fileName, parsed)
  return parsed
}

/**
 * Resolves a district code from a local boundary file, or `null` if the
 * point isn't inside any of its polygons. Deliberately swallows any error
 * (missing/malformed file, unexpected geometry) rather than letting it
 * propagate: a problem with one boundary layer — e.g. a typo'd file name
 * when a future maintainer adds a city per data/boundaries/README.md —
 * should degrade just that one layer to "unresolved", not take down the
 * whole match (which would otherwise fall through to the outer catch and
 * discard the CD/SD/AD/SUP codes already resolved before this call).
 */
function matchDistrictCode(lonLat: [number, number], layer: BoundaryLayer): string | null {
  try {
    const collection = loadBoundaryLayer(layer.file)
    const testPoint = point(lonLat)
    const feature = collection.features.find((candidate) =>
      booleanPointInPolygon(testPoint, candidate as Feature<Polygon | MultiPolygon>),
    )
    const value = feature?.properties?.[layer.property]
    return value === undefined || value === null ? null : `${layer.prefix}${value}`
  } catch (error) {
    console.error(
      `[match-ballot] boundary layer "${layer.file}" failed to load/match: ${describeError(error)}`,
    )
    return null
  }
}

/**
 * Census's layer names change on a schedule outside our control (e.g.
 * "119th Congressional Districts" becomes "120th" after the next election,
 * "2024 State Legislative Districts" gets a new year after redistricting).
 * Matching by substring instead of an exact key keeps this route working
 * across those renames without a code change.
 */
function findLayerValue(
  geographies: Record<string, unknown>,
  mustInclude: string[],
  field: string,
): string | null {
  const key = Object.keys(geographies).find((candidate) =>
    mustInclude.every((part) => candidate.toLowerCase().includes(part.toLowerCase())),
  )
  const entries = key ? geographies[key] : undefined
  if (!Array.isArray(entries) || entries.length === 0) return null
  const value = (entries[0] as Record<string, unknown>)[field]
  return typeof value === 'string' ? value : null
}

const OUTSIDE_RESULT: MatchBallotResult = {
  precision: 'none',
  citySlug: null,
  districtCodes: [],
  reason: 'outside',
}
const UNMATCHED_RESULT: MatchBallotResult = {
  precision: 'none',
  citySlug: null,
  districtCodes: [],
  reason: 'unmatched',
}
const INCOMPLETE_RESULT: MatchBallotResult = {
  precision: 'none',
  citySlug: null,
  districtCodes: [],
  reason: 'incomplete',
}

type CensusMatch = {
  matchedAddress?: string
  coordinates?: {x: number; y: number}
  addressComponents?: {fromAddress?: string; toAddress?: string}
  geographies?: Record<string, unknown>
}

class UpstreamStatusError extends Error {
  name = 'UpstreamStatusError'
  constructor(readonly status: number) {
    super(`HTTP ${status}`)
  }
}

/** Error name plus HTTP status — never the message, which can echo the URL. */
function describeError(error: unknown): string {
  if (error instanceof UpstreamStatusError) return `${error.name} ${error.status}`
  return error instanceof Error ? error.name : 'UnknownError'
}

async function fetchJson(url: URL, timeoutMs: number): Promise<unknown> {
  const response = await fetch(url, {signal: AbortSignal.timeout(timeoutMs)})
  if (!response.ok) throw new UpstreamStatusError(response.status)
  return response.json()
}

function censusOnelineUrl(base: string, address: string): URL {
  const url = new URL(base)
  url.searchParams.set('address', address)
  url.searchParams.set('benchmark', 'Public_AR_Current')
  url.searchParams.set('format', 'json')
  return url
}

/**
 * A body with no `result` is an upstream error, not "address not found" —
 * telling a voter their real address doesn't exist is worse than a retry.
 */
function firstAddressMatch(data: unknown): CensusMatch | undefined {
  const result = (data as {result?: {addressMatches?: CensusMatch[]}} | null)?.result
  if (!result) throw new Error('Census response had no result')
  return result.addressMatches?.[0]
}

/** A 4xx is about this request, and the fallback would reject it too. */
function isOutage(error: unknown): boolean {
  return !(error instanceof UpstreamStatusError && error.status < 500)
}

async function geocode(address: string): Promise<CensusMatch | undefined> {
  if (!geographiesCooldown.active()) {
    try {
      return await matchWithGeographies(address)
    } catch (error) {
      if (!isOutage(error)) throw error
      geographiesCooldown.trip()
      console.error(
        `[match-ballot] Census geographies failed (${describeError(error)}), falling back to locations + TIGERweb`,
      )
    }
  }
  return matchWithLocations(address)
}

async function matchWithGeographies(address: string): Promise<CensusMatch | undefined> {
  const url = censusOnelineUrl(CENSUS_GEOGRAPHIES_URL, address)
  url.searchParams.set('vintage', 'Current_Current')
  url.searchParams.set('layers', 'all')
  return firstAddressMatch(await fetchJson(url, GEOGRAPHIES_TIMEOUT_MS))
}

/** Same match shape as `matchWithGeographies`, minus `geographies`. */
async function matchWithLocations(address: string): Promise<CensusMatch | undefined> {
  const url = censusOnelineUrl(CENSUS_LOCATIONS_URL, address)
  return firstAddressMatch(await fetchJson(url, FALLBACK_TIMEOUT_MS))
}

/**
 * Looks up every TIGERweb layer under a point and reshapes the result into
 * the `geographies` record the Census geocoder returns (layer name → list of
 * attribute objects), so `findLayerValue` reads both the same way. The
 * "... Labels" layers repeat their parent's attributes and are skipped so a
 * substring match can't land on them.
 */
async function tigerwebGeographies([lon, lat]: [number, number]): Promise<Record<string, unknown>> {
  const url = new URL(TIGERWEB_IDENTIFY_URL)
  url.searchParams.set('geometry', `${lon},${lat}`)
  url.searchParams.set('geometryType', 'esriGeometryPoint')
  url.searchParams.set('sr', '4326')
  url.searchParams.set('layers', 'all')
  url.searchParams.set('tolerance', '0')
  url.searchParams.set('mapExtent', `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`)
  url.searchParams.set('imageDisplay', '100,100,96')
  url.searchParams.set('returnGeometry', 'false')
  url.searchParams.set('f', 'json')

  // ArcGIS reports errors as HTTP 200 with an `error` body instead of `results`.
  const data = (await fetchJson(url, FALLBACK_TIMEOUT_MS)) as {
    results?: Array<{layerName?: unknown; attributes?: unknown}>
  }
  if (!Array.isArray(data.results)) throw new Error('TIGERweb identify returned no results array')

  const geographies: Record<string, unknown[]> = {}
  for (const result of data.results) {
    if (typeof result.layerName !== 'string' || result.layerName.endsWith('Labels')) continue
    ;(geographies[result.layerName] ??= []).push(result.attributes)
  }
  return geographies
}

function lookupFailed() {
  return NextResponse.json({error: 'lookup failed'}, {status: 503})
}

export async function POST(request: Request) {
  let address: unknown
  try {
    const body = (await request.json()) as {address?: unknown}
    address = body.address
  } catch {
    return NextResponse.json({error: 'Invalid request body'}, {status: 400})
  }

  if (typeof address !== 'string' || address.trim().length === 0 || address.length > 200) {
    return NextResponse.json({error: 'address must be a non-empty string'}, {status: 400})
  }

  // A zip, a street name, or a PO Box is not a failed geocode and it is not
  // outside LA County. Don't send it to Census.
  if (isIncompleteAddress(address)) {
    return NextResponse.json(INCOMPLETE_RESULT)
  }

  try {
    const match = await geocode(address)
    if (!match?.coordinates) return NextResponse.json(UNMATCHED_RESULT)

    // A street-level snap, or a match of a different house number, is not
    // this address. That is "not found", including when the snapped point
    // happens to sit outside the county.
    const confirmed = censusMatchConfirmsHouseNumber(address, match.matchedAddress, {
      from: match.addressComponents?.fromAddress,
      to: match.addressComponents?.toAddress,
    })
    if (!confirmed) return NextResponse.json(UNMATCHED_RESULT)

    const lonLat: [number, number] = [match.coordinates.x, match.coordinates.y]
    // A `geographies` answer without the county layer is a degraded
    // response, not proof the address is outside LA County.
    const geographies =
      match.geographies && findLayerValue(match.geographies, ['counties'], 'GEOID') !== null
        ? match.geographies
        : await tigerwebGeographies(lonLat)

    const countyGeoid = findLayerValue(geographies, ['counties'], 'GEOID')
    if (countyGeoid !== LA_COUNTY_GEOID) {
      // Outside LA County — every race/measure in this guide is LA-County
      // scoped, so there's nothing to match against.
      return NextResponse.json(OUTSIDE_RESULT)
    }

    const congressional = findLayerValue(geographies, ['congressional', 'district'], 'BASENAME')
    const stateSenate = findLayerValue(
      geographies,
      ['state legislative districts', 'upper'],
      'BASENAME',
    )
    const stateAssembly = findLayerValue(
      geographies,
      ['state legislative districts', 'lower'],
      'BASENAME',
    )
    const placeName = findLayerValue(geographies, ['incorporated places'], 'BASENAME')

    const supervisorial = matchDistrictCode(lonLat, COUNTY_SUPERVISORIAL_LAYER)

    const citySlug = placeName ? slugifyPlaceName(placeName) : null
    const councilLayer = citySlug ? CITY_COUNCIL_LAYERS[citySlug] : undefined
    const councilDistrict = councilLayer ? matchDistrictCode(lonLat, councilLayer) : null

    const districtCodes = [
      congressional ? `CD${congressional}` : null,
      stateSenate ? `SD${stateSenate}` : null,
      stateAssembly ? `AD${stateAssembly}` : null,
      supervisorial,
      councilDistrict,
    ].filter((code): code is string => code !== null)

    // Only claim 'precise' for a city when its council boundary actually
    // resolved a district for this point — a sourced layer that the point
    // happens to fall outside of (data gap, annexation, etc.) degrades to
    // 'city' just like an unsourced one, rather than silently reporting a
    // city council race as filtered when it never actually matched.
    const precision: MatchBallotResult['precision'] =
      citySlug === null || councilDistrict !== null ? 'precise' : 'city'

    return NextResponse.json({precision, citySlug, districtCodes} satisfies MatchBallotResult)
  } catch (error) {
    // Deliberately log only the error name/timestamp — never `error` in
    // full (it can echo the request), and never the address itself.
    console.error(`[match-ballot] ${describeError(error)} at ${new Date().toISOString()}`)
    return lookupFailed()
  }
}
