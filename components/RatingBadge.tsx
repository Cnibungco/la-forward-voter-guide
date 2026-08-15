import {BADGE_ICONS, BADGE_LABELS, BADGE_SHORT_LABELS, type BadgeKind} from '@/lib/labels'

import styles from './RatingBadge.module.css'

const KIND_CLASS: Record<BadgeKind, string> = {
  no_recommendation: 'none',
  recommended: 'rec',
  endorsed: 'end',
  support: 'support',
  oppose: 'oppose',
  no_position: 'nopos',
}

interface RatingBadgeProps {
  kind: BadgeKind
  /** Landing legend: always the full label, even on a narrow screen. */
  alwaysFull?: boolean
}

/**
 * Shared badge for both entry ratings (No Recommendation / Recommended /
 * Endorsed) and measure positions (Support / Oppose / No Position).
 * One component, one visual language for "where the guide stands" —
 * matches the locked enums in lib/labels.ts.
 */
export function RatingBadge({kind, alwaysFull = false}: RatingBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[KIND_CLASS[kind]]} ${alwaysFull ? styles.alwaysFull : ''}`}>
      <span aria-hidden="true">{BADGE_ICONS[kind]}</span>
      <span className={styles.full}>{BADGE_LABELS[kind]}</span>
      <span className={styles.short}>{BADGE_SHORT_LABELS[kind]}</span>
    </span>
  )
}
