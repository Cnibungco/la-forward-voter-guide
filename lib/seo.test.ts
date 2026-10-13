import {describe, expect, it} from 'vitest'

import {ELECTION_NAME_FALLBACK, guidePageDescription, guideSnippet, siteDescription, siteTitle} from '@/lib/copy'
import {
  absoluteUrl,
  breadcrumbStructuredData,
  guideSitemap,
  jsonLdHtml,
  latestTimestamp,
  publicGuidePaths,
  siteStructuredData,
} from '@/lib/seo'
import type {GuideDistrict, GuideRegion, GuideSection} from '@/lib/types'

describe('publicGuidePaths', () => {
  it('lists the home, indexes, guides, and districts, and skips blank slugs', () => {
    expect(
      publicGuidePaths(
        [{slug: 'los-angeles'}, {slug: ''}, {slug: null}, {slug: 'statewide'}],
        [{slug: 'lausd'}, {slug: null}],
      ),
    ).toEqual(['/', '/cities', '/outside', '/guide/los-angeles', '/guide/statewide', '/districts/lausd'])
  })

  it('drops a repeated slug', () => {
    expect(publicGuidePaths([{slug: 'burbank'}, {slug: 'burbank'}], [])).toEqual([
      '/',
      '/cities',
      '/outside',
      '/guide/burbank',
    ])
  })
})

describe('siteStructuredData', () => {
  it('names LA Forward as the publisher and links its profiles', () => {
    const description = siteDescription(ELECTION_NAME_FALLBACK)
    const graph = siteStructuredData(description)['@graph']
    const org = graph[0]
    const site = graph[1]
    expect(org).toMatchObject({
      '@type': 'Organization',
      name: 'LA Forward',
      url: 'https://www.laforward.org',
      sameAs: [
        'https://www.instagram.com/laforward',
        'https://bsky.app/profile/laforward.org',
        'https://www.tiktok.com/@laforward',
        'https://www.linkedin.com/company/la-forward',
      ],
    })
    expect(org.logo).toMatchObject({
      url: absoluteUrl('/apple-icon.png'),
      width: 180,
      height: 180,
    })
    expect(site).toMatchObject({
      '@type': 'WebSite',
      name: 'LA Forward Voter Guide',
      description,
      publisher: {'@id': 'https://www.laforward.org/#organization'},
    })
  })
})

describe('breadcrumbStructuredData', () => {
  it('builds a home-then-page trail with absolute urls', () => {
    const data = breadcrumbStructuredData('Los Angeles', '/guide/los-angeles')
    expect(data.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'LA Forward Voter Guide',
        item: 'https://voterguide.laforward.org/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Los Angeles',
        item: 'https://voterguide.laforward.org/guide/los-angeles',
      },
    ])
  })
})

describe('jsonLdHtml', () => {
  it('escapes a less-than so it cannot close the script tag', () => {
    expect(jsonLdHtml({name: '</script>'})).toBe('{"name":"\\u003c/script>"}')
  })
})

describe('site title and snippets', () => {
  it('keeps the homepage title near 60 characters', () => {
    const title = siteTitle(ELECTION_NAME_FALLBACK)
    expect(title).toBe('Los Angeles, CA Progressive Voter Guide | November 2026')
    expect(title.length).toBeLessThanOrEqual(60)
  })

  it('names the election without calling every cycle a general election', () => {
    expect(siteDescription('March 2028')).toBe(
      'The Los Angeles, California Progressive Voter Guide for the March 2028 election by LA Forward. Endorsements and analysis for races and measures.',
    )
  })

  it('names the offices that fit and closes with and more', () => {
    const base = guidePageDescription('Burbank', 'November 2026')
    const topics = ['Mayor', 'City Council', 'City Treasurer', 'Measure A', 'Measure B', 'School Board', 'College Board']
    const snippet = guideSnippet('Burbank', 'November 2026', ['  Mayor  ', 'Mayor', ...topics.slice(1), '  '])

    expect(snippet.startsWith(base)).toBe(true)
    expect(snippet).toContain('Mayor')
    expect(snippet.endsWith('and more.')).toBe(true)
    expect(snippet.length).toBeLessThanOrEqual(155)
    expect(snippet).not.toContain('College Board')
  })

  it('lists every office when they fit', () => {
    expect(guideSnippet('Burbank', 'November 2026', ['Mayor'])).toBe(
      `${guidePageDescription('Burbank', 'November 2026')} Includes Mayor.`,
    )
  })

  it('stays on the base sentence when there are no offices', () => {
    expect(guideSnippet('Burbank', 'November 2026', [])).toBe(guidePageDescription('Burbank', 'November 2026'))
  })
})

describe('latestTimestamp', () => {
  it('returns the newest ISO stamp and ignores blanks', () => {
    expect(latestTimestamp([null, '', '2026-02-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'])).toBe(
      '2026-06-01T00:00:00.000Z',
    )
    expect(latestTimestamp([undefined, '  '])).toBeUndefined()
  })
})

describe('guideSitemap', () => {
  const board = (slug: string, updatedAt: string): GuideSection => ({
    _key: slug,
    _type: 'raceGroup',
    label: 'Board',
    races: [
      {
        _key: `${slug}-seat`,
        title: 'Seat 1',
        slug: `${slug}-seat`,
        office: null,
        district: null,
        context: null,
        contentStatus: 'published',
        entries: [
          {
            _id: `${slug}-ada`,
            name: 'Ada',
            slug: 'ada',
            photo: null,
            rating: 'endorsed',
            reasoning: null,
            updatedAt,
          },
        ],
      },
    ],
  })

  const district = (slug: string, updatedAt: string, entryUpdatedAt: string, cities: string[]): GuideDistrict => ({
    _id: slug,
    title: slug,
    slug,
    description: null,
    updatedAt,
    citiesServed: cities.map((city) => ({_id: city, title: city, slug: city})),
    sections: [board(slug, entryUpdatedAt)],
  })

  const region = (slug: string, tier: GuideRegion['tier'], updatedAt?: string): GuideRegion => ({
    _id: slug,
    title: slug,
    slug,
    tier,
    order: null,
    description: null,
    updatedAt,
    races: [],
    measures: [],
    sections: [],
  })

  const burbank: GuideRegion = {
    ...region('burbank', 'city', '2026-02-01T00:00:00.000Z'),
    races: [
      {
        _id: 'mayor',
        title: 'Mayor',
        slug: 'mayor',
        office: null,
        district: null,
        context: null,
        contentStatus: 'published',
        updatedAt: '2026-03-01T00:00:00.000Z',
        entries: [
          {
            _id: 'mayor-ada',
            name: 'Ada',
            slug: 'ada',
            photo: null,
            rating: 'endorsed',
            reasoning: null,
            updatedAt: '2026-04-01T00:00:00.000Z',
          },
        ],
      },
    ],
  }

  const guide = {
    regions: [burbank, region('california', 'state', '2026-01-15T00:00:00.000Z'), region('blank', 'county')],
    specialDistricts: [
      district('lausd', '2026-05-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z', ['burbank']),
      district('other', '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z', ['pasadena']),
    ],
    settings: {disclaimer: null, sampleBallotUrl: null, updatedAt: '2026-01-01T00:00:00.000Z'},
  }

  function modified(path: string): string | undefined {
    return guideSitemap(guide).find((entry) => entry.path === path)?.lastModified
  }

  it('uses the newest stamp in the guide for the home, city index, and outside page', () => {
    expect(modified('/')).toBe('2026-07-01T00:00:00.000Z')
    expect(modified('/cities')).toBe('2026-07-01T00:00:00.000Z')
    expect(modified('/outside')).toBe('2026-07-01T00:00:00.000Z')
  })

  it('dates a city page from that city and the districts rendered on it', () => {
    expect(modified('/guide/burbank')).toBe('2026-06-01T00:00:00.000Z')
    expect(modified('/guide/california')).toBe('2026-01-15T00:00:00.000Z')
    expect(modified('/districts/lausd')).toBe('2026-06-01T00:00:00.000Z')
    expect(modified('/districts/other')).toBe('2026-07-01T00:00:00.000Z')
  })

  it('omits lastModified when nothing on the page has a timestamp', () => {
    expect(guideSitemap(guide).find((entry) => entry.path === '/guide/blank')).toEqual({path: '/guide/blank'})
  })
})
