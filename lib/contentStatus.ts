import type {ContentStatus, GuideEntry, MeasureLike, RaceLike} from '@/lib/types'

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

/** Race listed on the ballot but with no candidates/write-up yet. */
export function raceNeedsWriteup(race: RaceLike): boolean {
  if (isDraftStatus(race.contentStatus)) return false
  if (isPendingStatus(race.contentStatus)) return true
  return visibleEntries(race.entries).length === 0
}
