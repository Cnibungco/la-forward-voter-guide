import Link from 'next/link'

import {RatingBadge} from '@/components/RatingBadge'
import {COMPACT_LEGEND} from '@/lib/labels'

import styles from './CompactLegend.module.css'

export function CompactLegend() {
  return (
    <div className={styles.row}>
      {COMPACT_LEGEND.map((kind) => (
        <RatingBadge key={kind} kind={kind} />
      ))}
      <Link href="/#ratings" className={styles.link}>
        What do these mean? →
      </Link>
    </div>
  )
}
