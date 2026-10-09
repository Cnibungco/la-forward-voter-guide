import {TrustCallout} from '@/components/TrustCallout'
import {METHODOLOGY_BODY, METHODOLOGY_SUMMARY} from '@/lib/copy'

import styles from './Methodology.module.css'

export function Methodology({trustStatement}: {trustStatement?: string}) {
  return (
    <details className={styles.details} id="methodology">
      <summary className={styles.summary}>
        <span>{METHODOLOGY_SUMMARY}</span>
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <div className={styles.body}>
        <p className={styles.para}>{METHODOLOGY_BODY}</p>
        <TrustCallout statement={trustStatement} />
      </div>
    </details>
  )
}
