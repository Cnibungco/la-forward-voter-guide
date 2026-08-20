import {describe, expect, it} from 'vitest'

import {endorsedCandidates} from '@/lib/endorsed'
import type {GuideEntry, GuideRegion, RaceLike} from '@/lib/types'

function entry(overrides: Partial<GuideEntry>): GuideEntry {
  return {
    _id: 'e1',
    name: 'Jane Doe',
    slug: 'jane',
    photo: null,
    rating: 'endorsed',
    reasoning: null,
    contentStatus: 'published',
    ...overrides,
  }
}

function race(overrides: Partial<RaceLike> & {_id?: string}): RaceLike & {_id: string} {
  return {
    _id: 'r1',
    title: 'Mayor',
    slug: 'mayor',
    office: null,
    district: null,
    context: null,
    entries: [entry({})],
    contentStatus: 'published',
    ...overrides,
  }
}

function region(overrides: Partial<GuideRegion>): GuideRegion {
  return {
    _id: 'city-1',
    title: 'Burbank',
    slug: 'burbank',
    tier: 'city',
    order: null,
    description: null,
    races: [],
    measures: [],
    sections: [],
    ...overrides,
  }
}

describe('endorsedCandidates', () => {
  it('returns published endorsed entries and skips drafts, pending, and other ratings', () => {
    const items = endorsedCandidates([
      region({
        races: [
          race({
            entries: [
              entry({_id: 'keep', name: 'Ava Endorsed', rating: 'endorsed'}),
              entry({_id: 'rec', name: 'Rec Only', rating: 'recommended'}),
              entry({_id: 'draft', name: 'Hidden', rating: 'endorsed', contentStatus: 'draft'}),
              entry({_id: 'pending', name: 'Soon', rating: 'endorsed', contentStatus: 'pending'}),
            ],
          }),
        ],
      }),
    ])
    expect(items.map((item) => item.entry._id)).toEqual(['keep'])
    expect(items[0]?.raceTitle).toBe('Mayor')
  })

  it('includes city ballot-race endorsements from sections', () => {
    const items = endorsedCandidates([
      region({
        sections: [
          {
            _key: 'g1',
            _type: 'raceGroup',
            label: 'Citywide',
            races: [
              {
                _key: 'k1',
                title: 'City Controller',
                slug: 'controller',
                office: null,
                district: null,
                context: null,
                contentStatus: 'published',
                entries: [entry({_id: 'ctrl', name: 'Pat Endorsed'})],
              },
            ],
          },
        ],
      }),
    ])
    expect(items.map((item) => item.entry.name)).toEqual(['Pat Endorsed'])
    expect(items[0]?.raceTitle).toBe('City Controller')
  })

  it('follows sidebar order: LA before other cities', () => {
    const items = endorsedCandidates([
      region({
        _id: 'whittier',
        title: 'Whittier',
        slug: 'whittier',
        races: [race({title: 'Council', entries: [entry({_id: 'w', name: 'W Endorsed'})]})],
      }),
      region({
        _id: 'la',
        title: 'Los Angeles',
        slug: 'los-angeles',
        races: [race({title: 'Mayor', entries: [entry({_id: 'l', name: 'L Endorsed'})]})],
      }),
    ])
    expect(items.map((item) => item.entry._id)).toEqual(['l', 'w'])
  })

  it('returns nothing when there are no live endorsements', () => {
    expect(endorsedCandidates([region({})])).toEqual([])
  })
})
