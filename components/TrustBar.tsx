import Link from 'next/link'

import {TRUST_STATEMENT} from '@/lib/copy'

import styles from './TrustBar.module.css'

export function TrustBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.icon} aria-hidden="true">
        ✓
      </span>
      <p className={styles.text}>
        {TRUST_STATEMENT}{' '}
        <Link href="#methodology" className={styles.link}>
          read how we research every race
        </Link>
        .
      </p>
    </div>
  )
}
