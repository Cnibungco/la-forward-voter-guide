'use client'

import Link from 'next/link'

import {LOAD_ERROR_BODY, LOAD_ERROR_TITLE, NOT_FOUND_HOME, TRY_AGAIN_LABEL} from '@/lib/copy'

import styles from './not-found.module.css'

export default function Error({reset}: {error: Error & {digest?: string}; reset: () => void}) {
  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>{LOAD_ERROR_TITLE}</h1>
      <p className={styles.body}>{LOAD_ERROR_BODY}</p>
      <p className={styles.links}>
        <button type="button" onClick={() => reset()}>
          {TRY_AGAIN_LABEL}
        </button>
        <Link href="/">{NOT_FOUND_HOME}</Link>
      </p>
    </main>
  )
}
