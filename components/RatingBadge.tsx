import {BADGE_ICONS, BADGE_LABELS, type BadgeIcon, type BadgeKind} from '@/lib/labels'

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

function BadgeGlyph({icon}: {icon: BadgeIcon}) {
  return (
    <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {icon === 'thumbs_up' && (
        <path
          fill="currentColor"
          d="M8.7 1.5c-.4 0-.7.2-.9.5L5.6 6H3.2C2.5 6 2 6.5 2 7.2v5.6C2 13.5 2.5 14 3.2 14h6.3c.5 0 1-.3 1.2-.8l2.1-5.2c.3-.8-.3-1.6-1.2-1.6H9.2V3.2c0-.9-.7-1.7-1.5-1.7zM4.2 12.8H3.2V7.2h1v5.6z"
        />
      )}
      {icon === 'star' && (
        <path
          fill="currentColor"
          d="M8 1.6 9.8 5.3l4.1.6-3 2.9.7 4.1L8 11l-3.6 1.9.7-4.1-3-2.9 4.1-.6L8 1.6z"
        />
      )}
      {icon === 'check' && (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.2 8.4 6.4 11.6 12.8 4.4"
        />
      )}
      {icon === 'x' && (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8"
        />
      )}
    </svg>
  )
}

/**
 * Shared badge for both entry ratings (No Recommendation / Recommended /
 * Endorsed) and measure positions (Support / Oppose / No Position).
 *
 * Icons follow the 8/19 pattern review: thumbs up, yellow star, green
 * check, red X. No Recommendation / No Position use a grey pill with
 * no icon — a minus/dash reads too much like "vote no".
 */
export function RatingBadge({kind, alwaysFull = false}: RatingBadgeProps) {
  const icon = BADGE_ICONS[kind]
  const className = [
    styles.badge,
    styles[KIND_CLASS[kind]],
    alwaysFull ? styles.alwaysFull : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className}>
      {icon ? <BadgeGlyph icon={icon} /> : null}
      {BADGE_LABELS[kind]}
    </span>
  )
}
