import Link from 'next/link'

import {CITIES_TITLE, NOT_FOUND_BODY, NOT_FOUND_HOME, NOT_FOUND_TITLE} from '@/lib/copy'

import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>{NOT_FOUND_TITLE}</h1>
      <p className={styles.body}>{NOT_FOUND_BODY}</p>
      <p className={styles.links}>
        <Link href="/">{NOT_FOUND_HOME}</Link>
        <Link href="/cities">{CITIES_TITLE}</Link>
      </p>
    </main>
  )
}
