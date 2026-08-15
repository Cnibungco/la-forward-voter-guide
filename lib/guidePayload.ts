import type {GuideRegion, SiteSettings} from '@/lib/types'

export interface GuidePayload {
  regions: GuideRegion[]
  settings: SiteSettings | null
}

type RawRegion = Omit<GuideRegion, 'races' | 'measures' | 'sections'> & {
  races?: GuideRegion['races'] | null
  measures?: GuideRegion['measures'] | null
  sections?: GuideRegion['sections'] | null
}

/**
 * Guard the GROQ result so pages never see null arrays. A missing
 * `races`/`measures`/`sections` field (or a null from an empty projection)
 * would otherwise throw when RegionSection reads `.length`.
 */
export function normalizeGuidePayload(data: {
  regions?: RawRegion[] | null
  settings?: SiteSettings | null
} | null): GuidePayload {
  return {
    regions: (data?.regions ?? []).map((region) => ({
      ...region,
      races: region.races ?? [],
      measures: region.measures ?? [],
      sections: region.sections ?? [],
    })),
    settings: data?.settings ?? null,
  }
}
