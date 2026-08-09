import type {PortableTextBlock} from '@portabletext/types'

/**
 * Hand-written types mirroring `GUIDE_QUERY` (sanity/lib/queries.ts).
 * Deliberately not generated via `sanity typegen` yet — per backend
 * strategy §7/§9, typegen is deferred until the schema settles past the
 * first real editor pass. Keep this in sync with the query by hand until
 * then; the shapes are small and stable (Region/Race/Measure/Entry, plus
 * the §11 city ballot blocks).
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

export type MeasurePosition = 'support' | 'oppose' | 'no_position'

export type RegionTier = 'state' | 'county' | 'city'

export interface GuideEntry {
  _id: string
  name: string
  slug: string | null
  photo: SanityImageValue | null
  rating: EntryRating | null
  reasoning: PortableTextBlock[] | null
}

/**
 * Fields shared by a State/County `race` document and a city-ballot
 * `ballotRace` block (see docs/backend-strategy.md §11) — everything
 * `RaceAccordion` needs to render, regardless of which document shape it
 * came from.
 */
export interface RaceLike {
  title: string
  slug: string | null
  office: string | null
  context: PortableTextBlock[] | null
  entries: GuideEntry[] | null
}

/**
 * Fields shared by a State/County `measure` document and a city-ballot
 * `ballotMeasure` block — everything `MeasureAccordion` needs to render.
 */
export interface MeasureLike {
  title: string
  slug: string | null
  summary: string | null
  position: MeasurePosition | null
  pros: PortableTextBlock[] | null
  cons: PortableTextBlock[] | null
}

export interface GuideRace extends RaceLike {
  _id: string
}

export interface GuideMeasure extends MeasureLike {
  _id: string
}

/** Embedded race inside a `raceGroup` block — ownership by containment, no `_id`. */
export interface GuideBallotRace extends RaceLike {
  _key: string
}

/** Embedded measure inside a `measureGroup` block — ownership by containment, no `_id`. */
export interface GuideBallotMeasure extends MeasureLike {
  _key: string
}

export interface GuideRaceGroup {
  _key: string
  _type: 'raceGroup'
  label: string
  races: GuideBallotRace[] | null
}

export interface GuideMeasureGroup {
  _key: string
  _type: 'measureGroup'
  label: string
  measures: GuideBallotMeasure[] | null
}

/** One block in a city Region's (or specialDistrict's) ordered `sections` array. */
export type GuideSection = GuideRaceGroup | GuideMeasureGroup

export interface GuideRegion {
  _id: string
  title: string
  slug: string | null
  tier: RegionTier
  order: number | null
  description: string | null
  /** State/County only — city ballots use `sections` instead. */
  races: GuideRace[]
  /** State/County only — city ballots use `sections` instead. */
  measures: GuideMeasure[]
  /**
   * City-tier only. Already merged with every `specialDistrict` that
   * lists this Region in `citiesServed` — own content first, districts
   * in title order. See the GROQ pattern in docs/backend-strategy.md §11.
   */
  sections: GuideSection[]
}
