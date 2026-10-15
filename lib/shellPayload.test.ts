import {describe, expect, it} from 'vitest'

import {filterGuideSearch} from '@/lib/guideSearch'
import {homeLinks, shellModel} from '@/lib/shellPayload'
import type {GuideRegion} from '@/lib/types'

const regions: GuideRegion[] = [
  {
    _id: 'la',
    title: 'City of Los Angeles',
    slug: 'los-angeles',
    tier: 'city',
    order: 1,
    description: 'A long city introduction that the sidebar does not show.',
    races: [],
    measures: [],
    sections: [
      {
        _key: 'citywide',
        _type: 'raceGroup',
        label: 'Citywide offices',
        races: [
          {
            _key: 'mayor',
            title: 'Mayor',
            slug: 'mayor',
            office: 'Mayor',
            district: null,
            context: [{_type: 'block', _key: 'c', children: [{_type: 'span', _key: 's', text: 'context'}]}],
            reasoning: [{_type: 'block', _key: 'r', children: [{_type: 'span', _key: 's', text: 'long write-up'}]}],
            contentStatus: 'published',
            entries: [
              {
                _id: 'raman',
                name: 'Nithya Raman',
                slug: 'nithya-raman',
                photo: {_type: 'image', asset: {_ref: 'image-abc-800x1000-jpg', _type: 'reference'}},
                rating: 'endorsed',
                reasoning: [{_type: 'block', _key: 'e', children: [{_type: 'span', _key: 's', text: 'poster essay'}]}],
                contentStatus: 'published',
              },
            ],
          },
        ],
      },
    ],
  },
]

describe('shellModel', () => {
  it('keeps the candidate searchable and leaves the write-up behind', () => {
    const model = shellModel(regions)
    const packed = JSON.stringify(model)

    expect(packed).not.toContain('poster essay')
    expect(packed).not.toContain('long write-up')
    expect(packed).not.toContain('image-abc')
    expect(model.cities.map((city) => city.slug)).toEqual(['los-angeles'])
    expect(filterGuideSearch(model.search, 'raman').map((hit) => hit.label)).toContain('Nithya Raman')
  })
})

describe('homeLinks', () => {
  it('points the homepage at the city without sending its races', () => {
    const links = homeLinks(regions)
    expect(links.guideHref).toBe('/guide/los-angeles')
    expect(links.laCity?.title).toBe('City of Los Angeles')
    expect(links.hasCities).toBe(true)
    expect(JSON.stringify(links)).not.toContain('Mayor')
  })
})
