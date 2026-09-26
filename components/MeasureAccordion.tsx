import {ComingSoonRow} from '@/components/ComingSoonRow'
import {PortableText} from '@/components/PortableText'
import {RatingBadge} from '@/components/RatingBadge'
import {isDraftStatus, measureNeedsWriteup} from '@/lib/contentStatus'
import type {MeasureLike} from '@/lib/types'

import styles from './Accordion.module.css'

interface MeasureAccordionProps {
  measure: MeasureLike
}

/**
 * Renders either a State/County `measure` document or a city-ballot
 * `ballotMeasure` block — see `MeasureLike` (lib/types.ts) and §11.
 */
export function MeasureAccordion({measure}: MeasureAccordionProps) {
  if (isDraftStatus(measure.contentStatus)) return null
  if (measureNeedsWriteup(measure)) {
    return <ComingSoonRow title={measure.title} id={measure.slug} />
  }

  return (
    <details className={styles.row} id={measure.slug ?? undefined}>
      <summary className={styles.summary}>
        <span className={styles.label}>{measure.title}</span>
        {measure.position && <RatingBadge kind={measure.position} />}
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <div className={styles.panel}>
        {measure.summary && <p className={styles.summaryText}>{measure.summary}</p>}
        <PortableText value={measure.reasoning} />
      </div>
    </details>
  )
}
