import {METHODOLOGY_BODY, METHODOLOGY_SUMMARY} from '@/lib/copy'

import styles from './Methodology.module.css'

export function Methodology() {
  return (
    <details className={styles.details} id="methodology">
      <summary className={styles.summary}>
        <span>{METHODOLOGY_SUMMARY}</span>
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <p className={styles.body}>{METHODOLOGY_BODY}</p>
    </details>
  )
}
