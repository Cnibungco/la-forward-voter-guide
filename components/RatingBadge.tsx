import type {BadgeTone} from '@/lib/labels'

import styles from './RatingBadge.module.css'

interface RatingBadgeProps {
  label: string
  tone: BadgeTone
}

/**
 * Shared badge for both entry ratings (No Recommendation / Recommended /
 * Endorsed) and measure positions (Support / Oppose / No Position).
 * One component, one visual language for "where the guide stands" —
 * matches the locked enums in lib/labels.ts.
 */
export function RatingBadge({label, tone}: RatingBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>
}
