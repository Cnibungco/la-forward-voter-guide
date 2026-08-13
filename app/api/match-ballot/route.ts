import fs from 'node:fs'
import path from 'node:path'

import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import {point} from '@turf/helpers'
import type {Feature, FeatureCollection, MultiPolygon, Polygon} from 'geojson'
import {NextResponse} from 'next/server'

import type {MatchBallotResult} from '@/lib/types'
import {slugifyPlaceName} from '@/lib/districtMatching'

/**
 * Address-based ballot matching. See docs/address-matching-strategy.md for
 * the decision doc and docs/backend-strategy.md §12 for the architecture.
 *
 * This is the one deliberate exception to the app's fully-static/ISR
 * model (see `.cursor/rules/data-fetching.mdc`) — Census's Geocoder has no
 * CORS support, so it can only be called server-side.
 *
 * Privacy: the submitted address is used only to make the one Census call
 * below and is never persisted, logged, or echoed into an analytics event
 * — including on error. Do not add a `console.error(err)` here that could
 * capture the request body; log only `error.name`/timestamp.
 */

const CENSUS_GEOCODER_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress'
const CENSUS_TIMEOUT_MS = 8000

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
  carson: {
    file: 'carson-council-districts.geojson',
    prefix: 'CC',
    property: 'DIV_CITY',
  },
  covina: {
    file: 'covina-council-districts.geojson',
    prefix: 'CC',
    property: 'District',
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
  torrance: {
    file: 'torrance-council-districts.geojson',
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
    const name = error instanceof Error ? error.name : 'UnknownError'
    console.error(`[match-ballot] boundary layer "${layer.file}" failed to load/match: ${name}`)
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

const NONE_RESULT: MatchBallotResult = {precision: 'none', citySlug: null, districtCodes: []}

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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CENSUS_TIMEOUT_MS)

  try {
    const url = new URL(CENSUS_GEOCODER_URL)
    url.searchParams.set('address', address)
    url.searchParams.set('benchmark', 'Public_AR_Current')
    url.searchParams.set('vintage', 'Current_Current')
    url.searchParams.set('layers', 'all')
    url.searchParams.set('format', 'json')

    const response = await fetch(url, {signal: controller.signal})
    if (!response.ok) return NextResponse.json(NONE_RESULT)

    const data = (await response.json()) as {
      result?: {
        addressMatches?: Array<{
          coordinates?: {x: number; y: number}
          geographies?: Record<string, unknown>
        }>
      }
    }

    const match = data.result?.addressMatches?.[0]
    if (!match?.coordinates || !match.geographies) return NextResponse.json(NONE_RESULT)

    const countyGeoid = findLayerValue(match.geographies, ['counties'], 'GEOID')
    if (countyGeoid !== LA_COUNTY_GEOID) {
      // Outside LA County — every race/measure in this guide is LA-County
      // scoped, so there's nothing to match against.
      return NextResponse.json(NONE_RESULT)
    }

    const congressional = findLayerValue(match.geographies, ['congressional', 'district'], 'BASENAME')
    const stateSenate = findLayerValue(
      match.geographies,
      ['state legislative districts', 'upper'],
      'BASENAME',
    )
    const stateAssembly = findLayerValue(
      match.geographies,
      ['state legislative districts', 'lower'],
      'BASENAME',
    )
    const placeName = findLayerValue(match.geographies, ['incorporated places'], 'BASENAME')

    const lonLat: [number, number] = [match.coordinates.x, match.coordinates.y]
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
    const name = error instanceof Error ? error.name : 'UnknownError'
    console.error(`[match-ballot] ${name} at ${new Date().toISOString()}`)
    return NextResponse.json(NONE_RESULT)
  } finally {
    clearTimeout(timeout)
  }
}
