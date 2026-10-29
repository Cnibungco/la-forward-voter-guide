import {afterEach, describe, expect, it, vi} from 'vitest'

import {geographiesCooldown} from '@/lib/geographiesCooldown'
import type {MatchBallotResult} from '@/lib/types'

import {POST} from './route'

afterEach(() => {
  vi.restoreAllMocks()
  geographiesCooldown.reset()
})

/**
 * Builds a minimal fake Census `geographies/onelineaddress` response.
 * Only includes the layer keys `route.ts` actually reads via
 * `findLayerValue` — real responses have ~20 more layers we don't care
 * about (see the live capture in this feature's original build for the
 * full shape).
 */
function censusResponse(opts: {
  x: number
  y: number
  countyGeoid?: string
  congressional?: string
  stateSenate?: string
  stateAssembly?: string
  placeName?: string | null
  houseNumber?: string
  matchedAddress?: string
  fromAddress?: string
  toAddress?: string
}) {
  const geographies: Record<string, Array<Record<string, string>>> = {
    Counties: [{GEOID: opts.countyGeoid ?? '06037'}],
  }
  if (opts.congressional) {
    geographies['119th Congressional Districts'] = [{BASENAME: opts.congressional}]
  }
  if (opts.stateSenate) {
    geographies['2024 State Legislative Districts - Upper'] = [{BASENAME: opts.stateSenate}]
  }
  if (opts.stateAssembly) {
    geographies['2024 State Legislative Districts - Lower'] = [{BASENAME: opts.stateAssembly}]
  }
  if (opts.placeName) {
    geographies['Incorporated Places'] = [{BASENAME: opts.placeName}]
  }
  const houseNumber = opts.houseNumber ?? '200'
  return {
    result: {
      addressMatches: [
        {
          matchedAddress: opts.matchedAddress ?? `${houseNumber} MAIN ST, LOS ANGELES, CA, 90012`,
          coordinates: {x: opts.x, y: opts.y},
          addressComponents:
            opts.fromAddress || opts.toAddress
              ? {fromAddress: opts.fromAddress, toAddress: opts.toAddress}
              : undefined,
          geographies,
        },
      ],
    },
  }
}

function mockFetchOnce(body: unknown, init: {ok?: boolean} = {}) {
  const fetchMock = vi.fn(async () => ({
    ok: init.ok ?? true,
    status: init.ok === false ? 502 : 200,
    json: async () => body,
  }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function postAddress(address: unknown) {
  return POST(
    new Request('http://localhost/api/match-ballot', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({address}),
    }),
  )
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

describe('POST /api/match-ballot — request validation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('rejects a body that is not valid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/match-ballot', {method: 'POST', body: '{not json'}),
    )
    expect(response.status).toBe(400)
  })

  it('rejects a missing address field', async () => {
    const response = await POST(
      new Request('http://localhost/api/match-ballot', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({}),
      }),
    )
    expect(response.status).toBe(400)
  })

  it('rejects an empty-string address', async () => {
    const response = await postAddress('   ')
    expect(response.status).toBe(400)
  })

  it('rejects a non-string address', async () => {
    const response = await postAddress(12345)
    expect(response.status).toBe(400)
  })

  it('rejects an address over 200 characters', async () => {
    const response = await postAddress('a'.repeat(201))
    expect(response.status).toBe(400)
  })

  it('accepts an address at exactly the 200-character boundary', async () => {
    mockFetchOnce({result: {addressMatches: []}})
    const prefix = '1 Main St, '
    const response = await postAddress(prefix + 'a'.repeat(200 - prefix.length))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })

  it('returns incomplete for a zip and does not call Census', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await postAddress('90012')
    expect(await response.json()).toEqual(INCOMPLETE_RESULT)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns incomplete for a street name with no house number', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await postAddress('Spring Street, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(INCOMPLETE_RESULT)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns incomplete for a PO Box', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await postAddress('PO Box 100, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(INCOMPLETE_RESULT)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/match-ballot — geocoding outcomes', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns 503 when Census geographies and locations both respond 502', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = mockFetchOnce({}, {ok: false})
    const response = await postAddress('123 Main St, Los Angeles, CA')
    expect(response.status).toBe(503)
    expect(fetchMock.mock.calls.map((call) => String((call as unknown[])[0]))).toEqual([
      expect.stringContaining('/geographies/'),
      expect.stringContaining('/locations/'),
    ])
  })

  it('returns unmatched when there are no address matches', async () => {
    mockFetchOnce({result: {addressMatches: []}})
    const response = await postAddress('123 Missing St, Los Angeles, CA')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })

  it('returns unmatched when the match is missing coordinates', async () => {
    mockFetchOnce({result: {addressMatches: [{geographies: {}, matchedAddress: '123 MAIN ST'}]}})
    const response = await postAddress('123 Main St, Los Angeles, CA')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })

  it('returns unmatched when the house number only matches the zip code', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        matchedAddress: '100 N SPRING ST, LOS ANGELES, CA, 90012',
        fromAddress: '100',
        toAddress: '198',
        placeName: 'Los Angeles',
      }),
    )
    const response = await postAddress('90012 N Spring St, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })

  it('returns unmatched when a different house number sits inside the Census range', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        matchedAddress: '100 N SPRING ST, LOS ANGELES, CA, 90012',
        fromAddress: '100',
        toAddress: '298',
        congressional: '34',
        stateSenate: '26',
        stateAssembly: '54',
        placeName: 'Los Angeles',
      }),
    )
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })

  it('returns unmatched when Census matched a different house number', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        houseNumber: '100',
        matchedAddress: '100 N SPRING ST, LOS ANGELES, CA, 90012',
        placeName: 'Los Angeles',
      }),
    )
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })

  it('returns outside for a confirmed street address outside LA County', async () => {
    mockFetchOnce(
      censusResponse({
        x: -117.87,
        y: 33.84,
        countyGeoid: '06059',
        placeName: 'Irvine',
        houseNumber: '1',
      }),
    )
    const response = await postAddress('1 Civic Center Plaza, Irvine, CA')
    expect(await response.json()).toEqual(OUTSIDE_RESULT)
  })

  it('returns 503 and never logs the address when the Census call throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('secret street address leaked here if this were logged')
      }),
    )
    const response = await postAddress('4321 Extremely Unique St, Los Angeles, CA')
    expect(response.status).toBe(503)
    for (const call of errorSpy.mock.calls) {
      const logged = call.join(' ')
      expect(logged).not.toContain('Extremely Unique St')
    }
  })

  it('accepts a house number inside the Census range when the matched line omits it', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        matchedAddress: 'N SPRING ST, LOS ANGELES, CA, 90012',
        fromAddress: '200',
        toAddress: '298',
        congressional: '34',
        stateSenate: '26',
        stateAssembly: '54',
        placeName: 'Los Angeles',
      }),
    )
    const response = await postAddress('250 N Spring St, Los Angeles, CA 90012')
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('precise')
    expect(result.citySlug).toBe('los-angeles')
  })

  it('returns unmatched when the house number falls on the other side of that range', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        matchedAddress: 'N SPRING ST, LOS ANGELES, CA, 90012',
        fromAddress: '200',
        toAddress: '298',
        placeName: 'Los Angeles',
      }),
    )
    const response = await postAddress('251 N Spring St, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
  })
})

describe('POST /api/match-ballot — real boundary-file matching', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('resolves LA City Hall to precise, CC14, SUP1 (verified against real Census + boundary data)', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        congressional: '34',
        stateSenate: '26',
        stateAssembly: '54',
        placeName: 'Los Angeles',
      }),
    )
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('precise')
    expect(result.citySlug).toBe('los-angeles')
    expect(result.districtCodes.sort()).toEqual(['AD54', 'CC14', 'CD34', 'SD26', 'SUP1'])
  })

  // Carson and Bell district numbers match live Census for these points
  // (verified 2026-10-28 via TIGERweb, 120th Congress / 2026 legislative maps).
  it('resolves Carson City Hall to precise, CC4, SUP2', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.263510536573,
        y: 33.831656027796,
        congressional: '44',
        stateSenate: '35',
        stateAssembly: '69',
        placeName: 'Carson',
        houseNumber: '701',
      }),
    )
    const response = await postAddress('701 E Carson St, Carson, CA 90745')
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('precise')
    expect(result.citySlug).toBe('carson')
    expect(result.districtCodes.sort()).toEqual(['AD69', 'CC4', 'CD44', 'SD35', 'SUP2'])
  })

  // Alhambra and Duarte council files come from the LA County RRCC
  // Precinct_Maps layer (added 2026-10-28). Duarte has 7 districts and
  // some MultiPolygon features.
  it.each([
    ['111 S 1st St, Alhambra, CA 91801', 'Alhambra', -118.127126367145, 34.093438217329, '111', 'CC2'],
    ['1401 Highland Ave, Duarte, CA 91010', 'Duarte', -117.966682637072, 34.137045049102, '1401', 'CC5'],
  ])('resolves %s to precise, %s', async (address, placeName, x, y, houseNumber, council) => {
    mockFetchOnce(censusResponse({x, y, placeName, houseNumber}))
    const response = await postAddress(address)
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('precise')
    expect(result.districtCodes).toContain(council)
  })

  it('degrades to "city" precision for an at-large city with no council boundary file', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.188759009488,
        y: 33.979786850676,
        congressional: '38',
        stateSenate: '33',
        stateAssembly: '64',
        placeName: 'Bell',
        houseNumber: '6330',
      }),
    )
    const response = await postAddress('6330 Pine Ave, Bell, CA 90201')
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('city')
    expect(result.citySlug).toBe('bell')
    expect(result.districtCodes.some((code) => code.startsWith('CC'))).toBe(false)
    // State/county codes should still be present even though city precision failed.
    expect(result.districtCodes.sort()).toEqual(['AD64', 'CD38', 'SD33', 'SUP4'])
  })

  it('slugifies a diacritic city name (La Cañada Flintridge) to the plain-ASCII convention', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.207001563149,
        y: 34.207622241093,
        congressional: '28',
        stateSenate: '25',
        stateAssembly: '41',
        placeName: 'La Cañada Flintridge',
        houseNumber: '1327',
      }),
    )
    const response = await postAddress('1327 Foothill Blvd, La Canada Flintridge, CA 91011')
    const result = (await response.json()) as MatchBallotResult
    expect(result.citySlug).toBe('la-canada-flintridge')
  })

  it('reports precise with citySlug null for unincorporated county land (no Incorporated Places match)', async () => {
    mockFetchOnce(
      censusResponse({
        x: -118.245593600365,
        y: 34.051621750302,
        congressional: '34',
        stateSenate: '26',
        stateAssembly: '54',
        placeName: null,
        houseNumber: '100',
      }),
    )
    const response = await postAddress('100 Some Unincorporated Rd, Los Angeles, CA')
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('precise')
    expect(result.citySlug).toBeNull()
    expect(result.districtCodes.some((code) => code.startsWith('CC'))).toBe(false)
  })
})

/**
 * Builds a fake TIGERweb `identify` response — one result per layer, with
 * a "... Labels" twin carrying deliberately wrong values so a test fails if
 * the route ever reads a label layer instead of the real one.
 */
function tigerwebResponse(layers: Record<string, Record<string, string>>) {
  return {
    results: Object.entries(layers).flatMap(([layerName, attributes]) => [
      {layerName: `${layerName} Labels`, attributes: {BASENAME: 'WRONG', GEOID: 'WRONG'}},
      {layerName, attributes},
    ]),
  }
}

const CITY_HALL_TIGERWEB = tigerwebResponse({
  Counties: {GEOID: '06037', BASENAME: 'Los Angeles'},
  'Incorporated Places': {GEOID: '0644000', BASENAME: 'Los Angeles'},
  '120th Congressional Districts': {GEOID: '0634', BASENAME: '34'},
  '2026 State Legislative Districts - Upper': {GEOID: '06026', BASENAME: '26'},
  '2026 State Legislative Districts - Lower': {GEOID: '06054', BASENAME: '54'},
})

/** Census `locations` has the same match shape as `geographies`, without the districts. */
function locationsResponse(houseNumber = '200') {
  const {result} = censusResponse({x: -118.245593600365, y: 34.051621750302, houseNumber})
  const match: Partial<(typeof result.addressMatches)[number]> = {...result.addressMatches[0]}
  delete match.geographies
  return {result: {addressMatches: [match]}}
}

type FakeReply = {ok?: boolean; status?: number; body?: unknown; throws?: boolean}

/** Routes each fetch by URL so the primary call and each fallback can fail independently. */
function mockFetchByUrl(replies: {geographies: FakeReply; locations?: FakeReply; tigerweb?: FakeReply}) {
  const fetchMock = vi.fn(async (input: URL | string) => {
    const url = String(input)
    const reply = url.includes('/geographies/')
      ? replies.geographies
      : url.includes('/locations/')
        ? replies.locations
        : url.includes('tigerweb')
          ? replies.tigerweb
          : undefined
    if (!reply) throw new Error(`unexpected fetch: ${url}`)
    if (reply.throws) throw new DOMException('The operation was aborted.', 'TimeoutError')
    const status = reply.status ?? (reply.ok === false ? 502 : 200)
    return {ok: status < 400, status, json: async () => reply.body}
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('POST /api/match-ballot — fallback when Census geographies is down', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    ['returns a 502', {ok: false}],
    ['times out', {throws: true}],
  ])('resolves LA City Hall through locations + TIGERweb when geographies %s', async (_, geographies) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchByUrl({
      geographies,
      locations: {body: locationsResponse()},
      tigerweb: {body: CITY_HALL_TIGERWEB},
    })
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    const result = (await response.json()) as MatchBallotResult
    expect(result.precision).toBe('precise')
    expect(result.citySlug).toBe('los-angeles')
    expect(result.districtCodes.sort()).toEqual(['AD54', 'CC14', 'CD34', 'SD26', 'SUP1'])
  })

  it('does not call the fallback when geographies answers', async () => {
    const fetchMock = mockFetchByUrl({geographies: {body: {result: {addressMatches: []}}}})
    const response = await postAddress('123 Missing St, Los Angeles, CA')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns unmatched without calling TIGERweb when locations matched a different house number', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = mockFetchByUrl({
      geographies: {ok: false},
      locations: {body: locationsResponse('100')},
    })
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(UNMATCHED_RESULT)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns outside when TIGERweb puts the point in another county', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchByUrl({
      geographies: {ok: false},
      locations: {body: locationsResponse()},
      tigerweb: {body: tigerwebResponse({Counties: {GEOID: '06059', BASENAME: 'Orange'}})},
    })
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(await response.json()).toEqual(OUTSIDE_RESULT)
  })

  it('returns 503 when TIGERweb answers HTTP 200 with an ArcGIS error body', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchByUrl({
      geographies: {ok: false},
      locations: {body: locationsResponse()},
      tigerweb: {body: {error: {code: 500, message: 'Unable to complete operation.'}}},
    })
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(response.status).toBe(503)
  })

  it('skips geographies for the next request after it fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = mockFetchByUrl({
      geographies: {throws: true},
      locations: {body: locationsResponse()},
      tigerweb: {body: CITY_HALL_TIGERWEB},
    })
    await postAddress('200 N Spring St, Los Angeles, CA 90012')
    fetchMock.mockClear()
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(response.status).toBe(200)
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/geographies/'))).toBe(false)
  })

  it('does not fall back on a 4xx, since locations would reject the request too', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = mockFetchByUrl({geographies: {status: 400}})
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(response.status).toBe(503)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(geographiesCooldown.active()).toBe(false)
  })

  it('falls back when geographies answers 200 with no result', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchByUrl({
      geographies: {body: {errors: ['Something went wrong']}},
      locations: {body: locationsResponse()},
      tigerweb: {body: CITY_HALL_TIGERWEB},
    })
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    expect(((await response.json()) as MatchBallotResult).citySlug).toBe('los-angeles')
  })

  it.each([
    ['an empty geographies object', {}],
    ['no geographies at all', undefined],
  ])('asks TIGERweb when geographies matches with %s', async (_, geographies) => {
    const {result} = censusResponse({x: -118.245593600365, y: 34.051621750302})
    const fetchMock = mockFetchByUrl({
      geographies: {body: {result: {addressMatches: [{...result.addressMatches[0], geographies}]}}},
      tigerweb: {body: CITY_HALL_TIGERWEB},
    })
    const response = await postAddress('200 N Spring St, Los Angeles, CA 90012')
    const match = (await response.json()) as MatchBallotResult
    expect(match.districtCodes.sort()).toEqual(['AD54', 'CC14', 'CD34', 'SD26', 'SUP1'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns 503 and never logs the address when every Census service is down', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchByUrl({geographies: {ok: false}, locations: {throws: true}})
    const response = await postAddress('4321 Extremely Unique St, Los Angeles, CA')
    expect(response.status).toBe(503)
    expect(errorSpy).toHaveBeenCalled()
    for (const call of errorSpy.mock.calls) {
      expect(call.join(' ')).not.toContain('Extremely Unique St')
    }
  })
})
