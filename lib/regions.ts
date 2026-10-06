import type {GuideRegion, RegionTier} from '@/lib/types'

export type LinkedRegion = GuideRegion & {slug: string}

export function hasSlug(region: GuideRegion): region is LinkedRegion {
  return typeof region.slug === 'string' && region.slug.length > 0
}

/**
 * Census slugifies "Los Angeles" to `los-angeles`. Editors sometimes title
 * the region "Los Angeles City", which generates `los-angeles-city`. Treat
 * those as the same city everywhere we match or highlight a ballot.
 */
export function canonicalCitySlug(slug: string): string {
  return slug === 'los-angeles-city' ? 'los-angeles' : slug
}

export function citySlugsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  return canonicalCitySlug(a) === canonicalCitySlug(b)
}

/** Census / our tests use `los-angeles`; editors might slug it `los-angeles-city`. */
export function isLosAngelesCity(region: GuideRegion): boolean {
  if (region.tier !== 'city' || !region.slug) return false
  return canonicalCitySlug(region.slug) === 'los-angeles'
}

export function regionMatchingCitySlug(
  regions: GuideRegion[],
  citySlug: string | null,
): GuideRegion | undefined {
  if (!citySlug) return undefined
  return regions.find((region) => region.tier === 'city' && citySlugsMatch(region.slug, citySlug))
}

function byOrderThenTitle(a: GuideRegion, b: GuideRegion): number {
  return (
    (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) ||
    a.title.localeCompare(b.title)
  )
}

/** First published region of this tier, by CMS `order` then title. Skips slugless rows. */
export function regionByTier(regions: GuideRegion[], tier: RegionTier): LinkedRegion | undefined {
  return regions.filter(hasSlug).filter((region) => region.tier === tier).sort(byOrderThenTitle)[0]
}

/** State then county, each in CMS `order` (then title). Used by the guide sidebar. */
export function navStateCounty(regions: GuideRegion[]): LinkedRegion[] {
  const linked = regions.filter(hasSlug)
  const state = linked.filter((region) => region.tier === 'state').sort(byOrderThenTitle)
  const county = linked.filter((region) => region.tier === 'county').sort(byOrderThenTitle)
  return [...state, ...county]
}

export function regionBySlug(regions: GuideRegion[], slug: string): GuideRegion | undefined {
  return regions.find((region) => region.slug === slug)
}

/**
 * Sidebar order: LA City pinned above an alphabetical list of the rest.
 * Regions without a slug can't be linked, so they're omitted.
 */
export function navCities(regions: GuideRegion[]): LinkedRegion[] {
  const cities = regions.filter(hasSlug).filter((region) => region.tier === 'city')
  const la = cities.filter(isLosAngelesCity)
  const rest = cities
    .filter((region) => !isLosAngelesCity(region))
    .sort((a, b) => a.title.localeCompare(b.title))
  return [...la, ...rest]
}

/** Sidebar order flattened: state & county, then local cities. */
export function navSequence(regions: GuideRegion[]): LinkedRegion[] {
  return [...navStateCounty(regions), ...navCities(regions)]
}

/**
 * Landing "View the Guide" target. Prefer the published LA City guide.
 * Otherwise the first region in sidebar order. `/cities` is the fallback
 * when nothing with a slug is published.
 */
export function preferredGuideHref(regions: GuideRegion[]): string {
  const la = regions.find(isLosAngelesCity)
  if (la?.slug) return `/guide/${la.slug}`
  const entry = navSequence(regions)[0]
  return entry ? `/guide/${entry.slug}` : '/cities'
}

/** Previous and next jurisdictions around `slug` in sidebar order. */
export function adjacentRegions(
  regions: GuideRegion[],
  slug: string | null | undefined,
): {prev: LinkedRegion | null; next: LinkedRegion | null} {
  if (!slug) return {prev: null, next: null}
  const sequence = navSequence(regions)
  const index = sequence.findIndex((region) => region.slug === slug)
  if (index === -1) return {prev: null, next: null}
  return {
    prev: sequence[index - 1] ?? null,
    next: sequence[index + 1] ?? null,
  }
}
