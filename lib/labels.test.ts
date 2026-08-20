import {describe, expect, it} from 'vitest'

import {
  BADGE_ICONS,
  BADGE_LABELS,
  BADGE_SHORT_LABELS,
  COMPACT_LEGEND,
  POSITION_ICONS,
  POSITION_LABELS,
  POSITION_SHORT_LABELS,
  RATING_ICONS,
  RATING_LABELS,
  RATING_SHORT_LABELS,
  TIER_CRUMBS,
  TIER_LABELS,
} from '@/lib/labels'
import type {EntryRating, MeasurePosition} from '@/lib/types'

const RATINGS: EntryRating[] = ['no_recommendation', 'recommended', 'endorsed']
const POSITIONS: MeasurePosition[] = ['support', 'oppose', 'no_position']

describe('locked rating and position copy', () => {
  it('has a full label and short label for every rating', () => {
    for (const rating of RATINGS) {
      expect(RATING_LABELS[rating].length).toBeGreaterThan(0)
      expect(RATING_SHORT_LABELS[rating].length).toBeGreaterThan(0)
      expect(BADGE_LABELS[rating]).toBe(RATING_LABELS[rating])
      expect(BADGE_SHORT_LABELS[rating]).toBe(RATING_SHORT_LABELS[rating])
      expect(BADGE_ICONS[rating]).toBe(RATING_ICONS[rating])
    }
  })

  it('maps candidate badges to thumbs up, yellow star, and no icon', () => {
    expect(RATING_ICONS.recommended).toBe('thumbs_up')
    expect(RATING_ICONS.endorsed).toBe('star')
    expect(RATING_ICONS.no_recommendation).toBeNull()
  })

  it('has a full label and short label for every measure position', () => {
    for (const position of POSITIONS) {
      expect(POSITION_LABELS[position].length).toBeGreaterThan(0)
      expect(POSITION_SHORT_LABELS[position].length).toBeGreaterThan(0)
      expect(BADGE_LABELS[position]).toBe(POSITION_LABELS[position])
      expect(BADGE_ICONS[position]).toBe(POSITION_ICONS[position])
    }
  })

  it('maps measure badges to green check, red X, and no icon', () => {
    expect(POSITION_ICONS.support).toBe('check')
    expect(POSITION_ICONS.oppose).toBe('x')
    expect(POSITION_ICONS.no_position).toBeNull()
  })

  it('lists every badge kind in the compact legend, candidates then measures', () => {
    expect(new Set(COMPACT_LEGEND)).toEqual(new Set([...RATINGS, ...POSITIONS]))
    expect(COMPACT_LEGEND).toEqual([
      'no_recommendation',
      'recommended',
      'endorsed',
      'no_position',
      'support',
      'oppose',
    ])
  })

  it('keeps breadcrumb copy in lockstep with section headings', () => {
    expect(TIER_CRUMBS).toEqual(TIER_LABELS)
  })
})
