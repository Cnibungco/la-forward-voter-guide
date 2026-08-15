import {METHODOLOGY_BODY, METHODOLOGY_SUMMARY, TRUST_STATEMENT} from '@/lib/copy'

import styles from './Methodology.module.css'

export function Methodology() {
  return (
    <details className={styles.details} id="methodology">
      <summary className={styles.summary}>
        <span>{METHODOLOGY_SUMMARY}</span>
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <div className={styles.body}>
        <p className={styles.para}>{METHODOLOGY_BODY}</p>
        <p className={styles.trust}>
          <span className={styles.trustIcon} aria-hidden="true">
            ✓
          </span>
          {TRUST_STATEMENT}
        </p>
      </div>
    </details>
  )
}
