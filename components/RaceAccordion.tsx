import {ComingSoonRow} from '@/components/ComingSoonRow'
import {EntryCard} from '@/components/EntryCard'
import {PortableText} from '@/components/PortableText'
import {isDraftStatus, raceCandidates, raceNeedsWriteup} from '@/lib/contentStatus'
import {raceRowLabel} from '@/lib/raceLabel'
import type {RaceLike} from '@/lib/types'

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
 * One row per candidate. A single-entry race shows "{title}: {name}"
 * on the row; multi-candidate races keep the race title as a heading.
 * Pending races (on the ballot, write-up not ready) render as
 * "Write-up coming soon" with no rating.
 */
export function RaceAccordion({race}: RaceAccordionProps) {
  if (isDraftStatus(race.contentStatus)) return null

  const entries = raceCandidates(race)

  if (raceNeedsWriteup(race)) {
    return <ComingSoonRow title={race.title} id={race.slug} />
  }

  return (
    <div className={styles.raceBlock} id={race.slug ?? undefined}>
      {entries.length !== 1 && race.title && <p className={styles.raceTitle}>{race.title}</p>}
      {race.office && entries.length !== 1 && <p className={styles.subtitle}>{race.office}</p>}
      {race.context && (
        <div className={styles.context}>
          <PortableText value={race.context} />
        </div>
      )}
      {entries.map((entry) => (
        <EntryCard key={entry._id} entry={entry} label={raceRowLabel(race, entry, entries)} />
      ))}
    </div>
  )
}
