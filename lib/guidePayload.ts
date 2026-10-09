import type {GuideDistrict, GuideDistrictCity, GuideRegion, GuideSection, SiteSettings} from '@/lib/types'

export interface GuidePayload {
  regions: GuideRegion[]
  specialDistricts: GuideDistrict[]
  settings: SiteSettings | null
}

type RawRegion = Omit<GuideRegion, 'races' | 'measures' | 'sections'> & {
  races?: GuideRegion['races'] | null
  measures?: GuideRegion['measures'] | null
  sections?: GuideRegion['sections'] | null
}

type RawDistrictCity = {
  _id?: string | null
  title?: string | null
  slug?: string | null
} | null

type RawDistrict = Omit<GuideDistrict, 'citiesServed' | 'sections'> & {
  citiesServed?: RawDistrictCity[] | null
  sections?: GuideSection[] | null
}

function byTitle(a: {title: string}, b: {title: string}): number {
  return a.title.localeCompare(b.title)
}

/** Drop broken references and cities that cannot be matched to a region slug. */
function normalizeCities(cities: RawDistrictCity[] | null | undefined): GuideDistrictCity[] {
  const result: GuideDistrictCity[] = []
  for (const city of cities ?? []) {
    if (!city?._id || typeof city.slug !== 'string' || city.slug.length === 0) continue
    result.push({_id: city._id, title: city.title ?? '', slug: city.slug})
  }
  return result
}

/**
 * Guard the GROQ result so pages never see null arrays. A missing
 * `races`/`measures`/`sections` field (or a null from an empty projection)
 * would otherwise throw when RegionSection reads `.length`.
 */
export function normalizeGuidePayload(data: {
  regions?: RawRegion[] | null
  specialDistricts?: RawDistrict[] | null
  settings?: SiteSettings | null
} | null): GuidePayload {
  return {
    regions: (data?.regions ?? []).map((region) => ({
      ...region,
      races: region.races ?? [],
      measures: region.measures ?? [],
      sections: region.sections ?? [],
    })),
    specialDistricts: (data?.specialDistricts ?? [])
      .map((district) => ({
        ...district,
        title: district.title ?? '',
        citiesServed: normalizeCities(district.citiesServed),
        sections: district.sections ?? [],
      }))
      .sort(byTitle),
    settings: data?.settings ?? null,
  }
}
