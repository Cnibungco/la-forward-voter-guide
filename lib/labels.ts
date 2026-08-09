import type {EntryRating, MeasurePosition} from '@/lib/types'

/**
 * Display strings for the locked rating/position enums (see
 * .cursor/rules/project-overview.mdc). If these values ever change,
 * that's a schema + product decision to confirm first, not something
 * to patch here in isolation.
 */
export const RATING_LABELS: Record<EntryRating, string> = {
  no_recommendation: 'No Recommendation',
  recommended: 'Recommended',
  endorsed: 'Endorsed',
}

export const POSITION_LABELS: Record<MeasurePosition, string> = {
  support: 'Support',
  oppose: 'Oppose',
  no_position: 'No Position',
}

export const TIER_LABELS = {
  state: 'State',
  county: 'County',
  city: 'City',
} as const

export type BadgeTone = 'neutral' | 'positive' | 'strong' | 'negative'

export const RATING_TONE: Record<EntryRating, BadgeTone> = {
  no_recommendation: 'neutral',
  recommended: 'positive',
  endorsed: 'strong',
}

export const POSITION_TONE: Record<MeasurePosition, BadgeTone> = {
  support: 'positive',
  oppose: 'negative',
  no_position: 'neutral',
}
