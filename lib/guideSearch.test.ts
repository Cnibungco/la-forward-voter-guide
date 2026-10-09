import {describe, expect, it} from 'vitest'

import {searchGuide} from '@/lib/guideSearch'
import type {GuideDistrict, GuideEntry, GuideRegion, GuideRace} from '@/lib/types'

function entry(overrides: Partial<GuideEntry> & Pick<GuideEntry, '_id' | 'name'>): GuideEntry {
  return {
    slug: overrides.name.toLowerCase().replace(/\s+/g, '-'),
    photo: null,
    rating: 'endorsed',
    reasoning: null,
    contentStatus: 'published',
    ...overrides,
  }
}

function race(overrides: Partial<GuideRace> & Pick<GuideRace, '_id' | 'title'>): GuideRace {
  return {
    slug: overrides._id,
    office: null,
    district: null,
    context: null,
    entries: null,
    contentStatus: 'published',
    ...overrides,
  }
}

function region(overrides: Partial<GuideRegion> & Pick<GuideRegion, '_id' | 'title' | 'slug' | 'tier'>): GuideRegion {
  return {
    order: null,
    description: null,
    races: [],
    measures: [],
    sections: [],
    ...overrides,
  }
}

describe('searchGuide', () => {
  const regions: GuideRegion[] = [
    region({
      _id: 'la',
      title: 'City of Los Angeles',
      slug: 'los-angeles',
      tier: 'city',
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
              context: null,
              contentStatus: 'published',
              entries: [entry({_id: 'raman', name: 'Nithya Raman'})],
            },
          ],
        },
        {
          _key: 'measures',
          _type: 'measureGroup',
          label: 'Ballot measures',
          measures: [
            {
              _key: 'ula',
              title: 'Measure ULA',
              slug: 'measure-ula',
              summary: 'A tax on property sales over $5 million.',
              position: 'support',
              reasoning: null,
              contentStatus: 'published',
            },
          ],
        },
      ],
    }),
    region({
      _id: 'state',
      title: 'Statewide Ballot Measures',
      slug: 'statewide-ballot-measures',
      tier: 'state',
      measures: [
        {
          _id: 'prop',
          title: 'Proposition 50',
          slug: 'proposition-50',
          summary: null,
          position: null,
          reasoning: null,
          contentStatus: 'published',
        },
      ],
    }),
    region({
      _id: 'offices',
      title: 'Statewide Offices',
      slug: 'statewide-offices',
      tier: 'state',
      races: [
        race({
          _id: 'governor',
          title: 'Governor',
          candidateName: 'Xavier Becerra',
          rating: 'endorsed',
          entries: [],
        }),
      ],
    }),
    region({
      _id: 'hidden',
      title: 'Hidden draft',
      slug: 'hidden',
      tier: 'city',
      races: [race({_id: 'draft-race', title: 'Secret Race', contentStatus: 'draft', entries: [entry({_id: 'secret', name: 'Secret Candidate'})]})],
    }),
    region({
      _id: 'noslug',
      title: 'Unlinked City',
      slug: null,
      tier: 'city',
    }),
  ]

  it('returns nothing for a blank query', () => {
    expect(searchGuide(regions, '   ')).toEqual([])
  })

  it('matches a candidate name ahead of a race, measure, or city', () => {
    const hits = searchGuide(regions, 'raman')
    expect(hits.map((hit) => hit.label)).toEqual(['Nithya Raman'])
    expect(hits[0]).toMatchObject({
      href: '/guide/los-angeles#nithya-raman',
      context: 'Mayor · City of Los Angeles',
    })
  })

  it('matches a candidate named on a state race', () => {
    const hits = searchGuide(regions, 'becerra')
    expect(hits.map((hit) => hit.label)).toEqual(['Xavier Becerra', 'Governor'])
    expect(hits[0]).toMatchObject({href: '/guide/statewide-offices#governor'})
  })

  it('matches a race title and its office', () => {
    expect(searchGuide(regions, 'mayor').map((hit) => hit.label)).toEqual(['Mayor'])
    expect(searchGuide(regions, 'mayor')[0]?.href).toBe('/guide/los-angeles#mayor')
  })

  it('matches a measure title, its summary, and a ballot section label', () => {
    expect(searchGuide(regions, 'property sales').map((hit) => hit.label)).toEqual(['Measure ULA'])
    const ballot = searchGuide(regions, 'ballot')
    expect(ballot.map((hit) => hit.label)).toEqual(['Measure ULA', 'Statewide Ballot Measures'])
  })

  it('still matches a city, and skips drafts and slugless regions', () => {
    expect(searchGuide(regions, 'los angeles').map((hit) => hit.label)).toEqual(['City of Los Angeles'])
    expect(searchGuide(regions, 'secret')).toEqual([])
    expect(searchGuide(regions, 'unlinked')).toEqual([])
  })

  it('indexes a special district once and links to its own page', () => {
    const districts: GuideDistrict[] = [
      {
        _id: 'lausd',
        title: 'Los Angeles Unified',
        slug: 'los-angeles-unified',
        description: null,
        citiesServed: [],
        sections: [
          {
            _key: 'board',
            _type: 'raceGroup',
            label: 'Board District 4',
            races: [
              {
                _key: 'board-4',
                title: 'Board District 4',
                slug: 'board-district-4',
                office: 'School board',
                district: 'SB4',
                context: null,
                contentStatus: 'published',
                entries: [entry({_id: 'board-member', name: 'Kelly Gonez'})],
              },
            ],
          },
        ],
      },
      {
        _id: 'nolink',
        title: 'Unlinked District',
        slug: null,
        description: null,
        citiesServed: [],
        sections: [],
      },
    ]

    expect(searchGuide(regions, 'unified', districts).map((hit) => hit.href)).toEqual(['/districts/los-angeles-unified'])
    expect(searchGuide(regions, 'gonez', districts)).toEqual([
      {
        key: 'entry:board-member',
        href: '/districts/los-angeles-unified#kelly-gonez',
        label: 'Kelly Gonez',
        context: 'Board District 4 · Los Angeles Unified',
      },
    ])
    expect(searchGuide(regions, 'unlinked district', districts)).toEqual([])
  })
})
