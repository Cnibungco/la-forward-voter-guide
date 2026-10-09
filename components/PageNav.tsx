import Link from 'next/link'

import styles from './PageNav.module.css'

interface PageTarget {
  title: string
  slug: string
}

interface PageNavProps {
  prev: PageTarget | null
  next: PageTarget | null
  hrefBase?: string
}

export function PageNav({prev, next, hrefBase = '/guide'}: PageNavProps) {
  if (!prev && !next) return null

  return (
    <nav className={styles.nav} aria-label="Previous and next jurisdictions">
      {prev ? (
        <Link href={`${hrefBase}/${prev.slug}`} className={styles.btn} aria-label={`Previous: ${prev.title}`}>
          <span className={styles.arrow} aria-hidden="true">
            ←
          </span>
          <span className={styles.label}>{prev.title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link
          href={`${hrefBase}/${next.slug}`}
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
