'use client'

import {useState} from 'react'

import {RatingBadge} from '@/components/RatingBadge'
import {LEGEND_TRIGGER} from '@/lib/copy'
import {CANDIDATE_LEGEND, MEASURE_LEGEND} from '@/lib/labels'

import styles from './CompactLegend.module.css'

export function CompactLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.info} aria-hidden="true">
          i
        </span>
        <span>{LEGEND_TRIGGER}</span>
        <span className={open ? `${styles.chev} ${styles.chevOpen}` : styles.chev} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.pop}>
          <div className={styles.grid}>
            {CANDIDATE_LEGEND.map((item) => (
              <div key={item.kind} className={styles.item}>
                <RatingBadge kind={item.kind} alwaysFull />
                <p className={styles.desc}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p className={styles.subHead}>For ballot measures</p>
          <div className={styles.grid}>
            {MEASURE_LEGEND.map((item) => (
              <div key={item.kind} className={styles.item}>
                <RatingBadge kind={item.kind} alwaysFull />
                <p className={styles.desc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
