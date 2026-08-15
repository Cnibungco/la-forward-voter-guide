import {describe, expect, it} from 'vitest'

import {firstOtherCity, isLosAngelesCity, navCities} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

function city(title: string, slug: string): GuideRegion {
  return {
    _id: slug,
    title,
    slug,
    tier: 'city',
    order: null,
    description: null,
    races: [],
    measures: [],
    sections: [],
  }
}

describe('navCities', () => {
  it('pins Los Angeles above an alphabetical list of the rest', () => {
    const ordered = navCities([city('Whittier', 'whittier'), city('Los Angeles', 'los-angeles'), city('Burbank', 'burbank')])
    expect(ordered.map((region) => region.slug)).toEqual(['los-angeles', 'burbank', 'whittier'])
  })

  it('treats los-angeles-city as LA for pinning', () => {
    expect(isLosAngelesCity(city('Los Angeles City', 'los-angeles-city'))).toBe(true)
  })

  it('picks the first non-LA city for the Other cities card', () => {
    const other = firstOtherCity([city('Los Angeles', 'los-angeles'), city('Alhambra', 'alhambra')])
    expect(other?.slug).toBe('alhambra')
  })
})
