/**
 * Accordion row text for a candidate. A one-person race folds the office
 * title and name together; a multi-candidate race lists names only and
 * keeps the office as a heading above the rows.
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
