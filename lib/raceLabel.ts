function normalizeWords(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * True when a race title only repeats its group heading.
 * "City Council" and "City Council (At-Large)" repeat a "City Council" group.
 * "City Council District 4" does not — the district is a separate heading.
 */
export function raceTitleRepeatsGroup(
  title: string | null | undefined,
  groupLabel: string | null | undefined,
): boolean {
  // Sanity leaves an empty race title as null. Trimming that throws during
  // static generation and fails the whole production build.
  if (typeof title !== 'string' || typeof groupLabel !== 'string') return false
  if (!groupLabel.trim() || !title.trim()) return false
  const race = normalizeWords(title)
  const group = normalizeWords(groupLabel)
  return race === group || race === `${group} at large`
}

/** Title to print under a group. Blank when the group heading already says it, or the title is missing. */
export function displayedRaceTitle(
  title: string | null | undefined,
  groupLabel?: string | null,
): string {
  if (typeof title !== 'string') return ''
  return raceTitleRepeatsGroup(title, groupLabel) ? '' : title
}

/**
 * Accordion row text for a candidate. A one-person race folds the office
 * title and name together; a multi-candidate race lists names only and
 * keeps the office as a heading above the rows. Pass a blank title when
 * the group heading already names the office.
 */
export function raceRowLabel(
  race: {title: string},
  entry: {name: string},
  entries: {name: string}[],
): string {
  if (entries.length === 1 && race.title) {
    if (race.title.includes(entry.name)) return race.title
    return `${race.title}: ${entry.name}`
  }
  return entry.name
}
