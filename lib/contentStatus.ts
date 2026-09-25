import type {ContentStatus, GuideEntry, GuideRegion, MeasureLike, RaceLike} from '@/lib/types'

export function isDraftStatus(status: ContentStatus | null | undefined): boolean {
  return status === 'draft'
}

/**
 * Explicit Content status of Pending. Missing status is not pending:
 * empty rating/position is handled separately so "No Recommendation"
 * (a real rating) never looks like a missing write-up.
 */
export function isPendingStatus(status: ContentStatus | null | undefined): boolean {
  return status === 'pending'
}

/** Drop draft entries if a GROQ filter ever lets one through. */
export function visibleEntries(entries: GuideEntry[] | null | undefined): GuideEntry[] {
  return (entries ?? []).filter((entry) => !isDraftStatus(entry.contentStatus))
}

/** Candidate with no rating yet. Not the same as rating = No Recommendation. */
export function entryNeedsWriteup(entry: GuideEntry): boolean {
  if (isDraftStatus(entry.contentStatus)) return false
  return isPendingStatus(entry.contentStatus) || !entry.rating
}

/** Measure with no position yet. Not the same as position = No Position. */
export function measureNeedsWriteup(measure: MeasureLike): boolean {
  if (isDraftStatus(measure.contentStatus)) return false
  return isPendingStatus(measure.contentStatus) || !measure.position
}

export function entryIsExpandable(entry: GuideEntry): boolean {
  return !isDraftStatus(entry.contentStatus) && !entryNeedsWriteup(entry)
}

export function measureIsExpandable(measure: MeasureLike): boolean {
  return !isDraftStatus(measure.contentStatus) && !measureNeedsWriteup(measure)
}

export function raceIsExpandable(race: RaceLike): boolean {
  if (isDraftStatus(race.contentStatus) || raceNeedsWriteup(race)) return false
  return visibleEntries(race.entries).some(entryIsExpandable)
}

/** Which rows can actually open. Coming-soon rows are not tappable. */
export function expandableContentKind(regions: GuideRegion[]): 'race' | 'measure' | null {
  let races = false
  let measures = false
  for (const region of regions) {
    const sections = region.sections ?? []
    if (region.races.some(raceIsExpandable)) races = true
    if (region.measures.some(measureIsExpandable)) measures = true
    for (const section of sections) {
      if (section._type === 'raceGroup' && (section.races ?? []).some(raceIsExpandable)) races = true
      if (section._type === 'measureGroup' && (section.measures ?? []).some(measureIsExpandable)) {
        measures = true
      }
    }
  }
  if (races) return 'race'
  if (measures) return 'measure'
  return null
}

/** Race listed on the ballot but with no candidates/write-up yet. */
export function raceNeedsWriteup(race: RaceLike): boolean {
  if (isDraftStatus(race.contentStatus)) return false
  if (isPendingStatus(race.contentStatus)) return true
  return visibleEntries(race.entries).length === 0
}
