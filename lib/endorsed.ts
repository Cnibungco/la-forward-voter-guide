import {entryNeedsWriteup, isDraftStatus, raceNeedsWriteup, visibleEntries} from '@/lib/contentStatus'
import {navSequence} from '@/lib/regions'
import type {GuideEntry, GuideRegion, RaceLike} from '@/lib/types'

export interface EndorsedCandidate {
  entry: GuideEntry
  raceTitle: string
  regionId: string
}

function racesInRegion(region: GuideRegion): RaceLike[] {
  const fromSections = region.sections.flatMap((section) =>
    section._type === 'raceGroup' ? (section.races ?? []) : [],
  )
  return [...region.races, ...fromSections]
}

/**
 * Published Endorsed candidates across the guide, in sidebar order then
 * race title then name. Used by the landing highlighted section.
 */
export function endorsedCandidates(regions: GuideRegion[]): EndorsedCandidate[] {
  const order = new Map(navSequence(regions).map((region, index) => [region._id, index]))
  const items: EndorsedCandidate[] = []

  for (const region of regions) {
    for (const race of racesInRegion(region)) {
      if (isDraftStatus(race.contentStatus) || raceNeedsWriteup(race)) continue
      for (const entry of visibleEntries(race.entries)) {
        if (entryNeedsWriteup(entry) || entry.rating !== 'endorsed') continue
        items.push({
          entry,
          raceTitle: race.title,
          regionId: region._id,
        })
      }
    }
  }

  return items.sort(
    (a, b) =>
      (order.get(a.regionId) ?? Number.POSITIVE_INFINITY) -
        (order.get(b.regionId) ?? Number.POSITIVE_INFINITY) ||
      a.raceTitle.localeCompare(b.raceTitle) ||
      a.entry.name.localeCompare(b.entry.name),
  )
}
