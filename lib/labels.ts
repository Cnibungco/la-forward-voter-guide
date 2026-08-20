import type {EntryRating, MeasurePosition} from '@/lib/types'

export type BadgeKind = EntryRating | MeasurePosition

/**
 * Icon drawn by RatingBadge. Null is deliberate: a dash/minus reads too
 * much like "vote no" (8/19 pattern review).
 */
export type BadgeIcon = 'thumbs_up' | 'star' | 'check' | 'x'

/**
 * Display strings for the locked rating/position enums (see
 * .cursor/rules/project-overview.mdc). If these values ever change,
 * that's a schema + product decision to confirm first, not something
 * to patch here in isolation.
 */
export const RATING_LABELS: Record<EntryRating, string> = {
  no_recommendation: 'No recommendation',
  recommended: 'Recommended',
  endorsed: 'Endorsed',
}

export const RATING_SHORT_LABELS: Record<EntryRating, string> = {
  no_recommendation: 'No rec.',
  recommended: 'Rec.',
  endorsed: 'Endorsed',
}

export const RATING_ICONS: Record<EntryRating, BadgeIcon | null> = {
  no_recommendation: null,
  recommended: 'thumbs_up',
  endorsed: 'star',
}

export const POSITION_LABELS: Record<MeasurePosition, string> = {
  support: 'Support',
  oppose: 'Oppose',
  no_position: 'No position',
}

export const POSITION_SHORT_LABELS: Record<MeasurePosition, string> = {
  support: 'Support',
  oppose: 'Oppose',
  no_position: 'No pos.',
}

export const POSITION_ICONS: Record<MeasurePosition, BadgeIcon | null> = {
  support: 'check',
  oppose: 'x',
  no_position: null,
}

export const TIER_LABELS = {
  state: 'State',
  county: 'County',
  city: 'Local cities',
} as const

export const TIER_CRUMBS = TIER_LABELS

export const BADGE_LABELS: Record<BadgeKind, string> = {
  ...RATING_LABELS,
  ...POSITION_LABELS,
}

export const BADGE_SHORT_LABELS: Record<BadgeKind, string> = {
  ...RATING_SHORT_LABELS,
  ...POSITION_SHORT_LABELS,
}

export const BADGE_ICONS: Record<BadgeKind, BadgeIcon | null> = {
  ...RATING_ICONS,
  ...POSITION_ICONS,
}

export const CANDIDATE_LEGEND: {kind: EntryRating; desc: string}[] = [
  {
    kind: 'no_recommendation',
    desc: "We looked at this race and didn't land on a position, and that's a rating too, not a skip.",
  },
  {
    kind: 'recommended',
    desc: 'Lines up with our values and priorities. Worth your vote.',
  },
  {
    kind: 'endorsed',
    desc: "We've vetted this candidate closely and back them without reservation.",
  },
]

export const MEASURE_LEGEND: {kind: MeasurePosition; desc: string}[] = [
  {
    kind: 'no_position',
    desc: "We didn't take a side on this one; reasoning is still behind the tap.",
  },
  {
    kind: 'support',
    desc: 'We think this measure should pass.',
  },
  {
    kind: 'oppose',
    desc: "We think this measure shouldn't pass.",
  },
]

export const COMPACT_LEGEND: BadgeKind[] = [
  'no_recommendation',
  'recommended',
  'endorsed',
  'no_position',
  'support',
  'oppose',
]
