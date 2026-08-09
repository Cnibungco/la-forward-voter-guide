import {EntryCard} from '@/components/EntryCard'
import {PortableText} from '@/components/PortableText'
import type {GuideRace} from '@/lib/types'

import styles from './Accordion.module.css'

interface RaceAccordionProps {
  race: GuideRace
}

/**
 * Native <details>/<summary> for expand/collapse — no client JS, no
 * hydration cost, keyboard/screen-reader support built into the browser.
 * Collapsed by default, matching how the guide is meant to be consumed
 * (backend strategy §3: "collapsed by default, expandable on click").
 */
export function RaceAccordion({race}: RaceAccordionProps) {
  return (
    <details className={styles.accordion} id={race.slug ?? undefined}>
      <summary className={styles.summary}>
        <span className={styles.title}>{race.title}</span>
        {race.office && <span className={styles.subtitle}>{race.office}</span>}
      </summary>
      <div className={styles.panel}>
        {race.context && (
          <div className={styles.context}>
            <PortableText value={race.context} />
          </div>
        )}
        {race.entries.length > 0 ? (
          <ul className={styles.entryList}>
            {race.entries.map((entry) => (
              <EntryCard key={entry._id} entry={entry} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No candidates entered yet.</p>
        )}
      </div>
    </details>
  )
}
