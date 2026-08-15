import {EntryCard} from '@/components/EntryCard'
import {PortableText} from '@/components/PortableText'
import type {GuideEntry, RaceLike} from '@/lib/types'

import styles from './Accordion.module.css'

interface RaceAccordionProps {
  race: RaceLike
}

/**
 * Native <details>/<summary> for expand/collapse — no client JS, no
 * hydration cost, keyboard/screen-reader support built into the browser.
 * Collapsed by default, matching how the guide is meant to be consumed
 * (backend strategy §3: "collapsed by default, expandable on click").
 *
 * Renders either a State/County `race` document or a city-ballot
 * `ballotRace` block — see `RaceLike` (lib/types.ts) and §11.
 *
 * One row per candidate. A single-entry race shows "{title} — {name}"
 * on the row; multi-candidate races keep the race title as a heading.
 */
export function RaceAccordion({race}: RaceAccordionProps) {
  const entries = race.entries ?? []

  return (
    <div className={styles.raceBlock}>
      {entries.length !== 1 && race.title && <p className={styles.raceTitle}>{race.title}</p>}
      {race.office && entries.length !== 1 && <p className={styles.subtitle}>{race.office}</p>}
      {race.context && (
        <div className={styles.context}>
          <PortableText value={race.context} />
        </div>
      )}
      {entries.length > 0 ? (
        entries.map((entry) => (
          <EntryCard key={entry._id} entry={entry} label={rowLabel(race, entry, entries)} />
        ))
      ) : (
        <p className={styles.empty}>No candidates entered yet.</p>
      )}
    </div>
  )
}

function rowLabel(race: RaceLike, entry: GuideEntry, entries: GuideEntry[]): string {
  if (entries.length === 1 && race.title) {
    if (race.title.includes(entry.name)) return race.title
    return `${race.title} — ${entry.name}`
  }
  return entry.name
}
