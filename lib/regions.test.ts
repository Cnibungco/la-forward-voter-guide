import {describe, expect, it} from 'vitest'

import {
  adjacentRegions,
  canonicalCitySlug,
  citySlugsMatch,
  hasSlug,
  isLosAngelesCity,
  navCities,
  navSequence,
  navStateCounty,
  preferredGuideHref,
  regionBySlug,
  regionByTier,
  regionMatchingCitySlug,
} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

function region(
  title: string,
  slug: string | null,
  tier: GuideRegion['tier'],
  order: number | null = null,
): GuideRegion {
  return {
    _id: slug ?? title,
    title,
    slug,
    tier,
    order,
    description: null,
    races: [],
    measures: [],
    sections: [],
  }
}

function city(title: string, slug: string | null): GuideRegion {
  return region(title, slug, 'city')
}

describe('canonicalCitySlug / citySlugsMatch', () => {
  it('folds los-angeles-city onto los-angeles', () => {
    expect(canonicalCitySlug('los-angeles-city')).toBe('los-angeles')
    expect(canonicalCitySlug('los-angeles')).toBe('los-angeles')
    expect(canonicalCitySlug('burbank')).toBe('burbank')
  })

  it('treats the two LA slugs as the same city and rejects nulls', () => {
    expect(citySlugsMatch('los-angeles', 'los-angeles-city')).toBe(true)
    expect(citySlugsMatch('los-angeles-city', 'los-angeles-city')).toBe(true)
    expect(citySlugsMatch('burbank', 'glendale')).toBe(false)
    expect(citySlugsMatch(null, 'los-angeles')).toBe(false)
    expect(citySlugsMatch('los-angeles', null)).toBe(false)
    expect(citySlugsMatch(null, null)).toBe(false)
  })
})

describe('isLosAngelesCity', () => {
  it('accepts both LA slugs and rejects other cities or tiers', () => {
    expect(isLosAngelesCity(city('Los Angeles', 'los-angeles'))).toBe(true)
    expect(isLosAngelesCity(city('Los Angeles City', 'los-angeles-city'))).toBe(true)
    expect(isLosAngelesCity(city('Burbank', 'burbank'))).toBe(false)
    expect(isLosAngelesCity(region('Statewide', 'props', 'state'))).toBe(false)
  })
})

describe('regionByTier', () => {
  it('picks the lowest CMS order, not array order, and skips slugless rows', () => {
    const ordered = regionByTier(
      [
        region('State Assembly', 'assembly', 'state', 4),
        region('Draft statewide', null, 'state', 0),
        region('Statewide Ballot Measures', 'props', 'state', 1),
      ],
      'state',
    )
    expect(ordered?.slug).toBe('props')
  })

  it('breaks remaining ties by title', () => {
    const picked = regionByTier(
      [region('Senate', 'senate', 'state', 1), region('Assembly', 'assembly', 'state', 1)],
      'state',
    )
    expect(picked?.slug).toBe('assembly')
  })
})

describe('regionBySlug / regionMatchingCitySlug', () => {
  it('finds an exact slug', () => {
    const regions = [city('Burbank', 'burbank')]
    expect(regionBySlug(regions, 'burbank')?.title).toBe('Burbank')
    expect(regionBySlug(regions, 'glendale')).toBeUndefined()
  })

  it('matches Census los-angeles to a los-angeles-city region', () => {
    const regions = [city('Los Angeles City', 'los-angeles-city'), city('Burbank', 'burbank')]
    expect(regionMatchingCitySlug(regions, 'los-angeles')?.slug).toBe('los-angeles-city')
  })

  it('does not match a null citySlug to a slugless region', () => {
    expect(regionMatchingCitySlug([city('Broken', null)], null)).toBeUndefined()
  })
})

describe('navStateCounty', () => {
  it('lists state regions by order, then county', () => {
    const ordered = navStateCounty([
      region('LA County Ballot Measures', 'county-measures', 'county', 1),
      region('State Assembly', 'assembly', 'state', 4),
      region('Statewide Ballot Measures', 'props', 'state', 1),
    ])
    expect(ordered.map((item) => item.slug)).toEqual(['props', 'assembly', 'county-measures'])
  })

  it('omits slugless regions so the sidebar never links to /guide/null', () => {
    const ordered = navStateCounty([
      region('Draft', null, 'state', 1),
      region('Statewide', 'props', 'state', 2),
    ])
    expect(ordered.map((item) => item.slug)).toEqual(['props'])
  })
})

describe('navCities', () => {
  it('pins Los Angeles above an alphabetical list of the rest', () => {
    const ordered = navCities([city('Whittier', 'whittier'), city('Los Angeles', 'los-angeles'), city('Burbank', 'burbank')])
    expect(ordered.map((item) => item.slug)).toEqual(['los-angeles', 'burbank', 'whittier'])
  })

  it('pins los-angeles-city the same way', () => {
    const ordered = navCities([city('Whittier', 'whittier'), city('Los Angeles City', 'los-angeles-city')])
    expect(ordered.map((item) => item.slug)).toEqual(['los-angeles-city', 'whittier'])
  })

  it('omits cities without a slug', () => {
    expect(navCities([city('Draft', null), city('Burbank', 'burbank')]).map((item) => item.slug)).toEqual(['burbank'])
  })
})

describe('navSequence / adjacentRegions', () => {
  const statewide = region('State of California', 'california', 'state', 1)
  const county = region('LA County', 'la-county', 'county', 1)
  const la = city('Los Angeles', 'los-angeles')
  const burbank = city('Burbank', 'burbank')
  const whittier = city('Whittier', 'whittier')

  it('follows sidebar order: state, county, LA, then alpha cities', () => {
    expect(navSequence([whittier, county, la, statewide, burbank]).map((item) => item.slug)).toEqual([
      'california',
      'la-county',
      'los-angeles',
      'burbank',
      'whittier',
    ])
  })

  it('returns prev and next around the current slug', () => {
    const {prev, next} = adjacentRegions([statewide, county, la, burbank], 'la-county')
    expect(prev?.slug).toBe('california')
    expect(next?.slug).toBe('los-angeles')
  })

  it('omits prev on the first item and next on the last', () => {
    const first = adjacentRegions([statewide, county, la], 'california')
    expect(first.prev).toBeNull()
    expect(first.next?.slug).toBe('la-county')

    const last = adjacentRegions([statewide, county, la], 'los-angeles')
    expect(last.prev?.slug).toBe('la-county')
    expect(last.next).toBeNull()
  })

  it('returns nulls for an unknown or empty slug', () => {
    expect(adjacentRegions([statewide], 'missing')).toEqual({prev: null, next: null})
    expect(adjacentRegions([statewide], null)).toEqual({prev: null, next: null})
  })
})

describe('preferredGuideHref', () => {
  const statewide = region('Statewide Ballot Measures', 'props', 'state', 1)
  const county = region('LA County Ballot Measures', 'county-measures', 'county', 1)
  const la = city('Los Angeles', 'los-angeles')
  const laAlt = city('Los Angeles City', 'los-angeles-city')
  const burbank = city('Burbank', 'burbank')

  it('opens the published LA City guide, using the CMS slug', () => {
    expect(preferredGuideHref([statewide, county, laAlt, burbank])).toBe('/guide/los-angeles-city')
    expect(preferredGuideHref([burbank, la, statewide])).toBe('/guide/los-angeles')
  })

  it('falls back to the first sidebar region when LA City is unpublished', () => {
    expect(preferredGuideHref([burbank, county, statewide])).toBe('/guide/props')
    expect(preferredGuideHref([burbank, county])).toBe('/guide/county-measures')
    expect(preferredGuideHref([city('Whittier', 'whittier'), burbank])).toBe('/guide/burbank')
  })

  it('skips slugless rows and falls back to the city list when nothing is linkable', () => {
    expect(preferredGuideHref([region('Draft statewide', null, 'state', 0), statewide])).toBe('/guide/props')
    expect(preferredGuideHref([city('Draft', null), city('Empty', '')])).toBe('/cities')
    expect(preferredGuideHref([])).toBe('/cities')
  })
})

describe('hasSlug', () => {
  it('rejects null and empty slugs', () => {
    expect(hasSlug(city('Burbank', 'burbank'))).toBe(true)
    expect(hasSlug(city('Draft', null))).toBe(false)
    expect(hasSlug(city('Empty', ''))).toBe(false)
  })
})
