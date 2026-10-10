import {describe, expect, it} from 'vitest'

import {
  absoluteUrl,
  breadcrumbStructuredData,
  jsonLdHtml,
  publicGuidePaths,
  siteStructuredData,
} from '@/lib/seo'

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
    const graph = siteStructuredData()['@graph']
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
