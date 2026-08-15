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

  const hasPros = Boolean(measure.pros && measure.pros.length > 0)
  const hasCons = Boolean(measure.cons && measure.cons.length > 0)

  return (
    <details className={styles.row} id={measure.slug ?? undefined}>
      <summary className={styles.summary}>
        <span className={styles.label}>{measure.title}</span>
        {measure.position && <RatingBadge kind={measure.position} />}
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <div className={styles.panel}>
        {measure.summary && <p className={styles.summaryText}>{measure.summary}</p>}
        {(hasPros || hasCons) && (
          <div className={styles.proCon}>
            {hasPros && (
              <div>
                <p className={styles.proConHeading}>What it would do</p>
                <PortableText value={measure.pros} />
              </div>
            )}
            {hasCons && (
              <div>
                <p className={styles.proConHeading}>The concern</p>
                <PortableText value={measure.cons} />
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
