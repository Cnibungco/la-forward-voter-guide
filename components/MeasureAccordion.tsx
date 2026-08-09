import {PortableText} from '@/components/PortableText'
import {RatingBadge} from '@/components/RatingBadge'
import {POSITION_LABELS, POSITION_TONE} from '@/lib/labels'
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
  return (
    <details className={styles.accordion} id={measure.slug ?? undefined}>
      <summary className={styles.summary}>
        <span className={styles.title}>{measure.title}</span>
        {measure.position && (
          <RatingBadge label={POSITION_LABELS[measure.position]} tone={POSITION_TONE[measure.position]} />
        )}
      </summary>
      <div className={styles.panel}>
        {measure.summary && <p className={styles.summaryText}>{measure.summary}</p>}
        <div className={styles.proCon}>
          {measure.pros && measure.pros.length > 0 && (
            <div>
              <h4 className={styles.proConHeading}>Pros</h4>
              <PortableText value={measure.pros} />
            </div>
          )}
          {measure.cons && measure.cons.length > 0 && (
            <div>
              <h4 className={styles.proConHeading}>Cons</h4>
              <PortableText value={measure.cons} />
            </div>
          )}
        </div>
      </div>
    </details>
  )
}
