import type {PortableTextBlock} from '@portabletext/types'

/**
 * Hand-written types mirroring `GUIDE_QUERY` (sanity/lib/queries.ts).
 * Deliberately not generated via `sanity typegen` yet — per backend
 * strategy §7/§9, typegen is deferred until the schema settles past the
 * first real editor pass. Keep this in sync with the query by hand until
 * then; the shapes are small and stable (Region/Race/Measure/Entry).
 *
 * The app intentionally does not depend on the `sanity` package (that's
 * Studio-only tooling, now confined to `studio-la-forward-voter-guide`).
 * `SanityImageValue` below is a minimal structural stand-in for the
 * Studio's `Image` type — just enough shape for `@sanity/image-url`.
 */

export interface SanityImageValue {
  _type?: 'image'
  asset: {_ref: string; _type: 'reference'}
  hotspot?: {x: number; y: number; height: number; width: number}
  crop?: {top: number; bottom: number; left: number; right: number}
}

export type EntryRating = 'no_recommendation' | 'recommended' | 'endorsed'

export type MeasureRecommendation = 'support' | 'oppose' | 'no_position'

export type RegionTier = 'state' | 'county' | 'city'

export interface GuideEntry {
  _id: string
  name: string
  slug: string | null
  photo: SanityImageValue | null
  rating: EntryRating | null
  reasoning: PortableTextBlock[] | null
}

export interface GuideRace {
  _id: string
  title: string
  slug: string | null
  office: string | null
  context: PortableTextBlock[] | null
  entries: GuideEntry[]
}

export interface GuideMeasure {
  _id: string
  title: string
  slug: string | null
  summary: string | null
  pros: PortableTextBlock[] | null
  cons: PortableTextBlock[] | null
  recommendation: MeasureRecommendation | null
}

export interface GuideRegion {
  _id: string
  title: string
  slug: string | null
  tier: RegionTier
  order: number | null
  description: string | null
  races: GuideRace[]
  measures: GuideMeasure[]
}
