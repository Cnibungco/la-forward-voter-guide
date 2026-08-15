import {describe, expect, it} from 'vitest'

import {normalizeGuidePayload} from '@/lib/guidePayload'
import type {GuideRegion} from '@/lib/types'

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
    expect(normalizeGuidePayload(null)).toEqual({regions: [], settings: null})
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
  })
})
