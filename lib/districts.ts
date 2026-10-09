import {citySlugsMatch} from '@/lib/regions'
import type {GuideDistrict, GuideSection} from '@/lib/types'

export type LinkedDistrict = GuideDistrict & {slug: string}

export function hasDistrictSlug(district: GuideDistrict): district is LinkedDistrict {
  return typeof district.slug === 'string' && district.slug.length > 0
}

function byTitle(a: {title: string}, b: {title: string}): number {
  return a.title.localeCompare(b.title)
}

/** Sidebar order: alphabetical. Districts without a slug cannot be linked. */
export function navDistricts(districts: GuideDistrict[]): LinkedDistrict[] {
  return districts.filter(hasDistrictSlug).sort(byTitle)
}

export function districtBySlug(districts: GuideDistrict[], slug: string): GuideDistrict | undefined {
  return districts.find((district) => district.slug === slug)
}

/** Districts whose `citiesServed` includes this city, in title order. */
export function districtsServingCity(
  districts: GuideDistrict[],
  citySlug: string | null | undefined,
): GuideDistrict[] {
  if (!citySlug) return []
  return districts
    .filter((district) => district.citiesServed.some((city) => citySlugsMatch(city.slug, citySlug)))
    .sort(byTitle)
}

export function sectionHasContent(section: GuideSection): boolean {
  if (section._type === 'raceGroup') return (section.races ?? []).length > 0
  return (section.measures ?? []).length > 0
}

export function districtHasContent(district: GuideDistrict): boolean {
  return district.sections.some(sectionHasContent)
}

/** Previous and next district around `slug`, in sidebar order. */
export function adjacentDistricts(
  districts: GuideDistrict[],
  slug: string | null | undefined,
): {prev: LinkedDistrict | null; next: LinkedDistrict | null} {
  if (!slug) return {prev: null, next: null}
  const sequence = navDistricts(districts)
  const index = sequence.findIndex((district) => district.slug === slug)
  if (index === -1) return {prev: null, next: null}
  return {
    prev: sequence[index - 1] ?? null,
    next: sequence[index + 1] ?? null,
  }
}
