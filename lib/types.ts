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

export type ContentStatus = 'draft' | 'pending' | 'published'

export type RegionTier = 'state' | 'county' | 'city'

export interface SiteKeyDate {
  _key: string
  date: string | null
  event: PortableTextBlock[] | null
  electionDay?: boolean | null
}

export interface SiteAboutParagraph {
  _key: string
  text: string | null
}

/**
 * New home-page fields are optional so a payload from before they
 * existed still type-checks. Resolvers treat missing and blank as
 * "use the copy.ts fallback," except the announcement, which hides.
 */
export interface SiteSettings {
  disclaimer: string | null
  sampleBallotUrl: string | null
  announcement?: string | null
  announcementLinkLabel?: string | null
  announcementLinkUrl?: string | null
  keyDates?: SiteKeyDate[] | null
  aboutSummary?: string | null
  aboutParagraphs?: SiteAboutParagraph[] | null
  trustStatement?: string | null
  donateAsk?: string | null
  campaignDonor?: string | null
}

export interface GuideEntry {
  _id: string
  name: string
  slug: string | null
  photo: SanityImageValue | null
  rating: EntryRating | null
  reasoning: PortableTextBlock[] | null
  contentStatus?: ContentStatus | null
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
  /**
   * Machine-matchable district code for address-based ballot matching
   * (e.g. "CD4", "SD24", "CC4"), or null for an at-large/citywide race —
   * those always render once their parent Region matches, regardless of
   * match precision. See docs/address-matching-strategy.md.
   */
  district: string | null
  context: PortableTextBlock[] | null
  entries: GuideEntry[] | null
  contentStatus?: ContentStatus | null
  /**
   * State/County races can rate one candidate on the race itself.
   * City ballot races leave these empty and use `entries`.
   */
  candidateName?: string | null
  rating?: EntryRating | null
  reasoning?: PortableTextBlock[] | null
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
  reasoning: PortableTextBlock[] | null
  contentStatus?: ContentStatus | null
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

/**
 * Response shape for `POST /api/match-ballot` — see
 * docs/address-matching-strategy.md and docs/backend-strategy.md §12.
 *
 * - `precision: "none"` — geocode failed, or the address is outside LA
 *   County. `citySlug`/`districtCodes` are meaningless in this case.
 * - `precision: "city"` — matched a city, but that city's own
 *   council-district boundary isn't sourced yet (see
 *   data/boundaries/README.md), so its races/measures render unfiltered.
 *   `districtCodes` is still populated with state/county codes.
 * - `precision: "precise"` — either matched to a city whose council
 *   boundary *is* sourced (see `CITY_COUNCIL_LAYERS` in
 *   `app/api/match-ballot/route.ts`), or the address is in unincorporated
 *   LA County (`citySlug: null`, nothing further to resolve).
 */
export interface MatchBallotResult {
  precision: 'precise' | 'city' | 'none'
  citySlug: string | null
  districtCodes: string[]
}

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
   * City-tier only: this city's own race and measure groups.
   * School and special districts are a separate `specialDistricts` list
   * and are joined onto a city by `citiesServed`.
   */
  sections: GuideSection[]
}

/** A city listed on a special district's `citiesServed` reference. */
export interface GuideDistrictCity {
  _id: string
  title: string
  slug: string
}

/**
 * A school board or other district that covers more than one city.
 * Rendered on its own page and, by name, on each city it serves.
 */
export interface GuideDistrict {
  _id: string
  title: string
  slug: string | null
  description: string | null
  citiesServed: GuideDistrictCity[]
  sections: GuideSection[]
}
