import {guideSearchIndex, type IndexedSearchHit} from '@/lib/guideSearch'
import {navDistricts} from '@/lib/districts'
import {isLosAngelesCity, navCities, navStateCounty, preferredGuideHref, regionByTier} from '@/lib/regions'
import type {GuideDistrict, GuideRegion} from '@/lib/types'

/**
 * What the sidebar, city list, and homepage actually render.
 * Names and links only — the write-ups stay on the page being read.
 */
export interface ShellPlace {
  id: string
  title: string
  slug: string
}

export interface ShellModel {
  stateCounty: ShellPlace[]
  cities: ShellPlace[]
  districts: ShellPlace[]
  search: IndexedSearchHit[]
}

/** Homepage cards. Four short links, not the guide. */
export interface HomeLinks {
  guideHref: string
  state: ShellPlace | null
  county: ShellPlace | null
  laCity: ShellPlace | null
  hasCities: boolean
}

function place(region: { _id: string; title: string; slug: string }): ShellPlace {
  return {id: region._id, title: region.title, slug: region.slug}
}

export function shellModel(regions: GuideRegion[], districts: GuideDistrict[] = []): ShellModel {
  return {
    stateCounty: navStateCounty(regions).map(place),
    cities: navCities(regions).map(place),
    districts: navDistricts(districts).map((district) => ({
      id: district._id,
      title: district.title,
      slug: district.slug,
    })),
    search: guideSearchIndex(regions, districts),
  }
}

export function homeLinks(regions: GuideRegion[]): HomeLinks {
  const state = regionByTier(regions, 'state')
  const county = regionByTier(regions, 'county')
  const laCity = regions.find(isLosAngelesCity)
  return {
    guideHref: preferredGuideHref(regions),
    state: state?.slug ? place({...state, slug: state.slug}) : null,
    county: county?.slug ? place({...county, slug: county.slug}) : null,
    laCity: laCity?.slug ? place({...laCity, slug: laCity.slug}) : null,
    hasCities: navCities(regions).length > 0,
  }
}
