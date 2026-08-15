import type {GuideRegion, RegionTier} from '@/lib/types'

/** Census / our tests use `los-angeles`; editors might slug it `los-angeles-city`. */
export function isLosAngelesCity(region: GuideRegion): boolean {
  if (region.tier !== 'city') return false
  const slug = region.slug ?? ''
  return slug === 'los-angeles' || slug === 'los-angeles-city'
}

export function regionByTier(regions: GuideRegion[], tier: RegionTier): GuideRegion | undefined {
  return regions.find((region) => region.tier === tier)
}

/** State then county, each in CMS `order` (then title). Used by the guide sidebar. */
export function navStateCounty(regions: GuideRegion[]): GuideRegion[] {
  const byOrder = (a: GuideRegion, b: GuideRegion) =>
    (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) ||
    a.title.localeCompare(b.title)

  const state = regions.filter((region) => region.tier === 'state' && region.slug).sort(byOrder)
  const county = regions.filter((region) => region.tier === 'county' && region.slug).sort(byOrder)
  return [...state, ...county]
}

export function regionBySlug(regions: GuideRegion[], slug: string): GuideRegion | undefined {
  return regions.find((region) => region.slug === slug)
}

/**
 * Sidebar order: LA City pinned above an alphabetical list of the rest.
 * Regions without a slug can't be linked, so they're omitted.
 */
export function navCities(regions: GuideRegion[]): GuideRegion[] {
  const cities = regions.filter((region) => region.tier === 'city' && region.slug)
  const la = cities.filter(isLosAngelesCity)
  const rest = cities
    .filter((region) => !isLosAngelesCity(region))
    .sort((a, b) => a.title.localeCompare(b.title))
  return [...la, ...rest]
}

export function firstOtherCity(regions: GuideRegion[]): GuideRegion | undefined {
  return navCities(regions).find((region) => !isLosAngelesCity(region))
}
