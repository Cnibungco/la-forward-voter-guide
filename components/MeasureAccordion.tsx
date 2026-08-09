import {PortableText} from '@/components/PortableText'
import {RatingBadge} from '@/components/RatingBadge'
import {RECOMMENDATION_LABELS, RECOMMENDATION_TONE} from '@/lib/labels'
import type {GuideMeasure} from '@/lib/types'

import styles from './Accordion.module.css'

interface MeasureAccordionProps {
  measure: GuideMeasure
}

export function MeasureAccordion({measure}: MeasureAccordionProps) {
  return (
    <details className={styles.accordion} id={measure.slug ?? undefined}>
      <summary className={styles.summary}>
        <span className={styles.title}>{measure.title}</span>
        {measure.recommendation && (
          <RatingBadge
            label={RECOMMENDATION_LABELS[measure.recommendation]}
            tone={RECOMMENDATION_TONE[measure.recommendation]}
          />
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
