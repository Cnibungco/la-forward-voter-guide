import {describe, expect, it} from 'vitest'

import {normalizeGuidePayload} from '@/lib/guidePayload'
import type {GuideDistrict, GuideRegion} from '@/lib/types'

function region(overrides: Partial<GuideRegion> = {}): GuideRegion {
  return {
    _id: 'r1',
    title: 'Statewide',
    slug: 'statewide',
    tier: 'state',
    order: 1,
    description: null,
    races: [],
    measures: [],
    sections: [],
    ...overrides,
  }
}

describe('normalizeGuidePayload', () => {
  it('turns a null fetch into empty regions and null settings', () => {
    expect(normalizeGuidePayload(null)).toEqual({regions: [], specialDistricts: [], settings: null})
  })

  it('replaces null races, measures, and sections with empty arrays', () => {
    const raw = region()
    const result = normalizeGuidePayload({
      regions: [{...raw, races: null, measures: null, sections: null}],
      settings: {disclaimer: 'Hi', sampleBallotUrl: null},
    })
    expect(result.regions[0]?.races).toEqual([])
    expect(result.regions[0]?.measures).toEqual([])
    expect(result.regions[0]?.sections).toEqual([])
    expect(result.settings?.disclaimer).toBe('Hi')
    expect(result.specialDistricts).toEqual([])
  })

  it('drops city references without a slug and sorts districts by title', () => {
    const district = (overrides: Partial<GuideDistrict> & Pick<GuideDistrict, '_id' | 'title'>): GuideDistrict => ({
      slug: overrides._id,
      description: null,
      citiesServed: [],
      sections: [],
      ...overrides,
    })

    const result = normalizeGuidePayload({
      regions: [],
      specialDistricts: [
        {
          ...district({_id: 'lausd', title: 'Los Angeles Unified'}),
          citiesServed: [
            {_id: 'la', title: 'Los Angeles', slug: 'los-angeles'},
            null,
            {_id: 'broken', title: 'Broken', slug: ''},
            {_id: 'missing'},
          ],
        },
        district({_id: 'abc', title: 'ABC Unified', slug: null, sections: null}),
      ],
    })

    expect(result.specialDistricts.map((item) => item.title)).toEqual(['ABC Unified', 'Los Angeles Unified'])
    expect(result.specialDistricts[0]?.sections).toEqual([])
    expect(result.specialDistricts[1]?.citiesServed).toEqual([
      {_id: 'la', title: 'Los Angeles', slug: 'los-angeles'},
    ])
  })
})
