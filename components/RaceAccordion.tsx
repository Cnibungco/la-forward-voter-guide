import {ComingSoonRow} from '@/components/ComingSoonRow'
import {EntryCard} from '@/components/EntryCard'
import {PortableText} from '@/components/PortableText'
import {isDraftStatus, raceCandidates, raceNeedsWriteup} from '@/lib/contentStatus'
import {displayedRaceTitle, raceRowLabel, raceTitleRepeatsGroup} from '@/lib/raceLabel'
import type {RaceLike} from '@/lib/types'

import styles from './Accordion.module.css'

interface RaceAccordionProps {
  race: RaceLike
  /** Race-group label, such as "City Council". A title that only repeats it is hidden. */
  groupLabel?: string
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
 * A title that only repeats the group label is omitted, so an at-large
 * city council lists the candidate names under "City Council".
 * Pending races (on the ballot, write-up not ready) render as
 * "Write-up coming soon" with no rating.
 */
export function RaceAccordion({race, groupLabel}: RaceAccordionProps) {
  if (isDraftStatus(race.contentStatus)) return null

  const entries = raceCandidates(race)
  const displayTitle = displayedRaceTitle(race.title, groupLabel)
  const officeRepeatsHeading =
    raceTitleRepeatsGroup(race.office ?? '', groupLabel) ||
    (displayTitle !== '' && raceTitleRepeatsGroup(race.office ?? '', displayTitle))

  if (raceNeedsWriteup(race)) {
    return <ComingSoonRow title={displayTitle} id={race.slug} />
  }

  return (
    <div className={styles.raceBlock} id={race.slug ?? undefined}>
      {entries.length !== 1 && displayTitle && <p className={styles.raceTitle}>{displayTitle}</p>}
      {race.office && entries.length !== 1 && !officeRepeatsHeading && (
        <p className={styles.subtitle}>{race.office}</p>
      )}
      {race.context && (
        <div className={styles.context}>
          <PortableText value={race.context} />
        </div>
      )}
      {entries.map((entry) => (
        <EntryCard key={entry._id} entry={entry} label={raceRowLabel({title: displayTitle}, entry, entries)} />
      ))}
    </div>
  )
}
