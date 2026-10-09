import {describe, expect, it} from 'vitest'

import {adjacentDistricts, districtHasContent, districtsServingCity, navDistricts} from '@/lib/districts'
import type {GuideDistrict} from '@/lib/types'

function district(overrides: Partial<GuideDistrict> & Pick<GuideDistrict, '_id' | 'title'>): GuideDistrict {
  return {
    slug: overrides._id,
    description: null,
    citiesServed: [],
    sections: [],
    ...overrides,
  }
}

describe('navDistricts', () => {
  it('sorts by title and skips a district with no slug', () => {
    const ordered = navDistricts([
      district({_id: 'lausd', title: 'Los Angeles Unified'}),
      district({_id: 'missing', title: 'Unlinked', slug: null}),
      district({_id: 'abc', title: 'ABC Unified'}),
    ])
    expect(ordered.map((item) => item.slug)).toEqual(['abc', 'lausd'])
  })
})

describe('districtsServingCity', () => {
  const lausd = district({
    _id: 'lausd',
    title: 'Los Angeles Unified',
    citiesServed: [{_id: 'la', title: 'Los Angeles', slug: 'los-angeles-city'}],
  })
  const abc = district({
    _id: 'abc',
    title: 'ABC Unified',
    citiesServed: [{_id: 'cerritos', title: 'Cerritos', slug: 'cerritos'}],
  })

  it('matches the LA city slug alias and ignores other districts', () => {
    expect(districtsServingCity([abc, lausd], 'los-angeles').map((item) => item._id)).toEqual(['lausd'])
  })

  it('returns nothing for an unincorporated address', () => {
    expect(districtsServingCity([lausd], null)).toEqual([])
  })
})

describe('districtHasContent', () => {
  it('is false when every group is empty', () => {
    expect(
      districtHasContent(
        district({
          _id: 'lausd',
          title: 'Los Angeles Unified',
          sections: [{_key: 'rg', _type: 'raceGroup', label: 'Board', races: []}],
        }),
      ),
    ).toBe(false)
  })
})

describe('adjacentDistricts', () => {
  const abc = district({_id: 'abc', title: 'ABC Unified'})
  const lausd = district({_id: 'lausd', title: 'Los Angeles Unified'})

  it('walks districts in title order and stops at the ends', () => {
    expect(adjacentDistricts([lausd, abc], 'abc')).toEqual({prev: null, next: lausd})
    expect(adjacentDistricts([lausd, abc], 'lausd').next).toBeNull()
  })

  it('returns nulls for an unknown slug', () => {
    expect(adjacentDistricts([abc], 'missing')).toEqual({prev: null, next: null})
  })
})
