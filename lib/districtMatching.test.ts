import {describe, expect, it} from 'vitest'

import {coverablePrefixesFor, filterRegionsByMatch, isMatchBallotResult, passesDistrictFilter, slugifyPlaceName} from './districtMatching'
import type {GuideRegion, MatchBallotResult} from './types'

const NONE: MatchBallotResult = {precision: 'none', citySlug: null, districtCodes: []}
const UNINCORPORATED: MatchBallotResult = {
  precision: 'precise',
  citySlug: null,
  districtCodes: ['CD34', 'SD26', 'AD54', 'SUP1'],
}
const LA_CITY_PRECISE: MatchBallotResult = {
  precision: 'precise',
  citySlug: 'los-angeles',
  districtCodes: ['CD34', 'SD26', 'AD54', 'SUP1', 'CC14'],
}
// A city whose council boundary is sourced, but this particular address
// didn't land inside any of its polygons (the case the precision-fix in
// app/api/match-ballot/route.ts now reports as 'city' rather than
// 'precise' — this result shape is what a bug in that logic would look
// like, so keeping it as its own fixture pins the fix in place).
const CITY_UNRESOLVED_COUNCIL: MatchBallotResult = {
  precision: 'city',
  citySlug: 'los-angeles',
  districtCodes: ['CD34', 'SD26', 'AD54', 'SUP1'],
}
const AT_LARGE_CITY: MatchBallotResult = {
  precision: 'city',
  citySlug: 'bell',
  districtCodes: ['CD40', 'SD30', 'AD57', 'SUP1'],
}

describe('slugifyPlaceName', () => {
  it('lowercases and hyphenates a simple name', () => {
    expect(slugifyPlaceName('Los Angeles')).toBe('los-angeles')
  })

  it('handles a single-word name', () => {
    expect(slugifyPlaceName('Carson')).toBe('carson')
  })

  it('transliterates diacritics to their base letter instead of deleting them', () => {
    // Census returns this with a real "ñ" (verified live 2026-08-13); the
    // conventional/expected slug uses a plain "n", not a dropped letter.
    expect(slugifyPlaceName('La Cañada Flintridge')).toBe('la-canada-flintridge')
  })

  it('collapses multiple separators and trims leading/trailing dashes', () => {
    expect(slugifyPlaceName('  Rancho Palos Verdes  ')).toBe('rancho-palos-verdes')
  })

  it('is a no-op on an already-clean slug-like string', () => {
    expect(slugifyPlaceName('la-canada-flintridge')).toBe('la-canada-flintridge')
  })
})

describe('coverablePrefixesFor', () => {
  it('returns nothing for a "none" match', () => {
    expect(coverablePrefixesFor(NONE)).toEqual([])
  })

  it('returns exactly the prefixes present in districtCodes', () => {
    expect([...coverablePrefixesFor(UNINCORPORATED)].sort()).toEqual(['AD', 'CD', 'SD', 'SUP'])
  })

  it('includes CC once a city council district actually resolved', () => {
    expect(coverablePrefixesFor(LA_CITY_PRECISE)).toContain('CC')
  })

  it('does not include CC when the council layer failed to resolve for this address', () => {
    expect(coverablePrefixesFor(CITY_UNRESOLVED_COUNCIL)).not.toContain('CC')
  })

  it('does not include CC for an at-large city with no council layer at all', () => {
    expect(coverablePrefixesFor(AT_LARGE_CITY)).not.toContain('CC')
  })
})

describe('passesDistrictFilter', () => {
  it('always shows at-large/citywide races (no district code)', () => {
    expect(passesDistrictFilter(null, NONE)).toBe(true)
    expect(passesDistrictFilter(null, LA_CITY_PRECISE)).toBe(true)
  })

  it('shows everything unfiltered when there was no match at all', () => {
    expect(passesDistrictFilter('CC14', NONE)).toBe(true)
    expect(passesDistrictFilter('SUP3', NONE)).toBe(true)
  })

  it('shows a race whose exact code is in districtCodes', () => {
    expect(passesDistrictFilter('CC14', LA_CITY_PRECISE)).toBe(true)
    expect(passesDistrictFilter('SUP1', LA_CITY_PRECISE)).toBe(true)
  })

  it('hides a race on a coverable prefix that does not match this address', () => {
    expect(passesDistrictFilter('CC3', LA_CITY_PRECISE)).toBe(false)
    expect(passesDistrictFilter('SUP4', LA_CITY_PRECISE)).toBe(false)
  })

  it('never hides a race on a prefix we have not sourced/resolved (graceful degradation)', () => {
    // School board sub-districts and trustee areas: no boundary data exists.
    expect(passesDistrictFilter('SB3', LA_CITY_PRECISE)).toBe(true)
    expect(passesDistrictFilter('TA2', LA_CITY_PRECISE)).toBe(true)
    // At-large city: no CC layer configured at all.
    expect(passesDistrictFilter('CC2', AT_LARGE_CITY)).toBe(true)
  })

  it('never hides a council race when the sourced boundary failed to resolve for this address', () => {
    // This is the specific bug fixed in coverablePrefixesFor: a sourced
    // layer that the point falls outside of must not be treated as "this
    // address is verified NOT in CC14", or every council race would
    // wrongly disappear.
    expect(passesDistrictFilter('CC14', CITY_UNRESOLVED_COUNCIL)).toBe(true)
    expect(passesDistrictFilter('CC3', CITY_UNRESOLVED_COUNCIL)).toBe(true)
  })

  it('is tolerant of whitespace and case in the stored district code', () => {
    expect(passesDistrictFilter('  cc14  ', LA_CITY_PRECISE)).toBe(true)
    expect(passesDistrictFilter('', LA_CITY_PRECISE)).toBe(true)
    expect(passesDistrictFilter('   ', LA_CITY_PRECISE)).toBe(true)
  })
})

function makeRegion(overrides: Partial<GuideRegion>): GuideRegion {
  return {
    _id: overrides._id ?? 'region-1',
    title: overrides.title ?? 'Test Region',
    slug: overrides.slug ?? 'test-region',
    tier: overrides.tier ?? 'state',
    order: overrides.order ?? null,
    description: overrides.description ?? null,
    races: overrides.races ?? [],
    measures: overrides.measures ?? [],
    sections: overrides.sections ?? [],
  }
}

describe('filterRegionsByMatch', () => {
  it('returns regions unchanged when there was no match', () => {
    const regions = [makeRegion({tier: 'city', slug: 'los-angeles'}), makeRegion({tier: 'state'})]
    expect(filterRegionsByMatch(regions, NONE)).toBe(regions)
  })

  it('keeps state and county regions regardless of city match', () => {
    const state = makeRegion({_id: 'state', tier: 'state'})
    const county = makeRegion({_id: 'county', tier: 'county'})
    const result = filterRegionsByMatch([state, county], LA_CITY_PRECISE)
    expect(result.map((r) => r._id)).toEqual(['state', 'county'])
  })

  it('keeps only the matched city region and drops every other city', () => {
    const matched = makeRegion({_id: 'la', tier: 'city', slug: 'los-angeles'})
    const other = makeRegion({_id: 'sm', tier: 'city', slug: 'santa-monica'})
    const result = filterRegionsByMatch([matched, other], LA_CITY_PRECISE)
    expect(result.map((r) => r._id)).toEqual(['la'])
  })

  it('drops every city region for an unincorporated-county match (citySlug null)', () => {
    const cityRegion = makeRegion({_id: 'la', tier: 'city', slug: 'los-angeles'})
    const result = filterRegionsByMatch([cityRegion], UNINCORPORATED)
    expect(result).toEqual([])
  })

  it('does not match a city region whose slug is null against an unincorporated (null) citySlug', () => {
    // Regression guard: null-citySlug must never accidentally equal a
    // malformed/unpublished region with a null slug.
    const malformed = makeRegion({_id: 'broken', tier: 'city', slug: null})
    const result = filterRegionsByMatch([malformed], UNINCORPORATED)
    expect(result).toEqual([])
  })

  it('trims a matched region\'s races by district but leaves measures untouched', () => {
    const region = makeRegion({
      _id: 'la',
      tier: 'city',
      slug: 'los-angeles',
      races: [
        {_id: 'r1', title: 'Council D14', slug: 'r1', office: null, district: 'CC14', context: null, entries: null},
        {_id: 'r2', title: 'Council D3', slug: 'r2', office: null, district: 'CC3', context: null, entries: null},
        {_id: 'r3', title: 'Mayor', slug: 'r3', office: null, district: null, context: null, entries: null},
      ],
      measures: [{_id: 'm1', title: 'Measure A', slug: 'm1', summary: null, position: null, reasoning: null}],
    })
    const [result] = filterRegionsByMatch([region], LA_CITY_PRECISE)
    expect(result.races.map((r) => r._id)).toEqual(['r1', 'r3'])
    expect(result.measures).toHaveLength(1)
  })

  it('trims raceGroup sections by district but leaves measureGroup sections untouched', () => {
    const region = makeRegion({
      _id: 'la',
      tier: 'city',
      slug: 'los-angeles',
      sections: [
        {
          _key: 'rg1',
          _type: 'raceGroup',
          label: 'City Council',
          races: [
            {_key: 'a', title: 'D14', slug: null, office: null, district: 'CC14', context: null, entries: null},
            {_key: 'b', title: 'D3', slug: null, office: null, district: 'CC3', context: null, entries: null},
          ],
        },
        {
          _key: 'mg1',
          _type: 'measureGroup',
          label: 'City Measures',
          measures: [{_key: 'c', title: 'Measure Z', slug: null, summary: null, position: null, reasoning: null}],
        },
      ],
    })
    const [result] = filterRegionsByMatch([region], LA_CITY_PRECISE)
    const raceGroup = result.sections.find((s) => s._type === 'raceGroup')
    const measureGroup = result.sections.find((s) => s._type === 'measureGroup')
    expect(raceGroup?._type === 'raceGroup' && raceGroup.races?.map((r) => r._key)).toEqual(['a'])
    expect(measureGroup?._type === 'measureGroup' && measureGroup.measures).toHaveLength(1)
  })

  it('handles a raceGroup with a null races array without throwing', () => {
    const region = makeRegion({
      tier: 'city',
      slug: 'los-angeles',
      sections: [{_key: 'rg1', _type: 'raceGroup', label: 'Empty', races: null}],
    })
    expect(() => filterRegionsByMatch([region], LA_CITY_PRECISE)).not.toThrow()
  })

  it('keeps a los-angeles-city CMS region when Census returns los-angeles', () => {
    const matched = makeRegion({_id: 'la', tier: 'city', slug: 'los-angeles-city'})
    const other = makeRegion({_id: 'sm', tier: 'city', slug: 'santa-monica'})
    const result = filterRegionsByMatch([matched, other], LA_CITY_PRECISE)
    expect(result.map((r) => r._id)).toEqual(['la'])
  })
})

describe('isMatchBallotResult', () => {
  it('accepts a well-formed result', () => {
    expect(isMatchBallotResult(LA_CITY_PRECISE)).toBe(true)
    expect(isMatchBallotResult(NONE)).toBe(true)
  })

  it('rejects missing fields, bad precision, and non-string district codes', () => {
    expect(isMatchBallotResult(null)).toBe(false)
    expect(isMatchBallotResult({precision: 'maybe', citySlug: null, districtCodes: []})).toBe(false)
    expect(isMatchBallotResult({precision: 'precise', citySlug: 'los-angeles'})).toBe(false)
    expect(isMatchBallotResult({precision: 'precise', citySlug: null, districtCodes: [14]})).toBe(false)
  })
})
