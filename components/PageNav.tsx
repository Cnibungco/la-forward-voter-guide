import Link from 'next/link'

import type {LinkedRegion} from '@/lib/regions'

import styles from './PageNav.module.css'

interface PageNavProps {
  prev: LinkedRegion | null
  next: LinkedRegion | null
}

export function PageNav({prev, next}: PageNavProps) {
  if (!prev && !next) return null

  return (
    <nav className={styles.nav} aria-label="Previous and next jurisdictions">
      {prev ? (
        <Link href={`/guide/${prev.slug}`} className={styles.btn} aria-label={`Previous: ${prev.title}`}>
          <span className={styles.arrow} aria-hidden="true">
            ←
          </span>
          <span className={styles.label}>{prev.title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link
          href={`/guide/${next.slug}`}
          className={`${styles.btn} ${styles.next}`}
          aria-label={`Next: ${next.title}`}
        >
          <span className={styles.label}>{next.title}</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </Link>
      ) : null}
    </nav>
  )
}
