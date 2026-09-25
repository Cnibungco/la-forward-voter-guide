import {RatingBadge} from '@/components/RatingBadge'
import {MEASURE_LEGEND_HEAD, NO_REC_LEGEND_NOTE} from '@/lib/copy'
import {CANDIDATE_LEGEND, MEASURE_LEGEND} from '@/lib/labels'

import styles from './RatingLegend.module.css'

/** Candidate and measure ratings, shared by the landing page and the guide popover. */
export function RatingLegend() {
  return (
    <>
      <p className={styles.note}>{NO_REC_LEGEND_NOTE}</p>
      <div className={styles.grid}>
        {CANDIDATE_LEGEND.map((item) => (
          <div key={item.kind} className={styles.item}>
            <RatingBadge kind={item.kind} alwaysFull />
            <p className={styles.desc}>{item.desc}</p>
          </div>
        ))}
      </div>
      <p className={styles.subHead}>{MEASURE_LEGEND_HEAD}</p>
      <div className={styles.grid}>
        {MEASURE_LEGEND.map((item) => (
          <div key={item.kind} className={styles.item}>
            <RatingBadge kind={item.kind} alwaysFull />
            <p className={styles.desc}>{item.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}
