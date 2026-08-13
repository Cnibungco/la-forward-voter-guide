import type {GuideRegion, MatchBallotResult} from '@/lib/types'

/**
 * District code prefixes we can resolve via the state/county boundary
 * layers used by `app/api/match-ballot/route.ts` (Census-provided CD/SD/AD,
 * plus the county-wide supervisorial GeoJSON) — available for every LA
 * County address, city or unincorporated. See
 * data/boundaries/README.md for what's sourced and what isn't.
 */
export const STATE_COUNTY_PREFIXES = ['CD', 'SD', 'AD', 'SUP'] as const

/**
 * City council district prefix (see the code convention in
 * docs/backend-strategy.md §12). Only resolvable for a city whose council
 * boundaries are actually sourced — currently just LA City, hence
 * `result.precision === 'precise'` rather than `'city'`. Kept as a named
 * constant (not inlined) so it's obvious what "the one extra prefix
 * `precise` unlocks" means when reading `coverablePrefixesFor` below.
 */
export const CITY_COUNCIL_PREFIX = 'CC'

function districtPrefix(code: string): string {
  return code.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? ''
}

/**
 * Which district-code prefixes this match result can actually be trusted
 * to filter by. Anything outside this set (school board sub-districts,
 * community college trustee areas, most cities' council districts — none
 * of that boundary data is sourced yet) is deliberately treated as
 * "unknown" rather than "no match", so `passesDistrictFilter` never hides
 * a race we simply can't verify.
 */
export function coverablePrefixesFor(result: MatchBallotResult): readonly string[] {
  if (result.precision === 'none') return []
  if (result.precision === 'precise' && result.citySlug !== null) {
    return [...STATE_COUNTY_PREFIXES, CITY_COUNCIL_PREFIX]
  }
  return STATE_COUNTY_PREFIXES
}

/**
 * Should a race/measure with this `district` code be shown for a given
 * match result? Never hides content on a boundary layer we haven't
 * sourced — see docs/address-matching-strategy.md's graceful-degradation
 * requirement. A district code only hides content when we affirmatively
 * resolved that layer for this address *and* it didn't match.
 */
export function passesDistrictFilter(district: string | null, result: MatchBallotResult): boolean {
  if (!district) return true // at-large / citywide — always shown once its Region is in view
  if (result.precision === 'none') return true
  if (result.districtCodes.includes(district)) return true
  return !coverablePrefixesFor(result).includes(districtPrefix(district))
}

/**
 * Census's `Incorporated Places` names ("Los Angeles", "Long Beach") into
 * the kebab-case slug convention used by `region.slug` in this app (see
 * `schemaTypes/region.ts` — slugs are generated from `title` with the same
 * shape). No hardcoded city list to maintain: any city Census resolves
 * that also happens to have a matching Region slug in Sanity will match
 * automatically.
 */
export function slugifyPlaceName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Applies a match result to the already-fetched `GuideRegion[]` (the same
 * data `GUIDE_QUERY` returned) — this is filtering, not a second Sanity
 * query, per the "one nested GROQ query" decision. State/County regions
 * always stay in view (every LA County address is in the same state and
 * county) with their races trimmed by district; City regions are dropped
 * entirely unless they're the matched city, since a voter's ballot never
 * includes another city's races. Measures have no `district` field (see
 * schemaTypes/measure.ts) — they're never filtered, only their Region's
 * inclusion matters.
 */
export function filterRegionsByMatch(regions: GuideRegion[], match: MatchBallotResult): GuideRegion[] {
  if (match.precision === 'none') return regions

  return regions
    .filter((region) => region.tier !== 'city' || region.slug === match.citySlug)
    .map((region) => ({
      ...region,
      races: region.races.filter((race) => passesDistrictFilter(race.district, match)),
      sections: region.sections.map((section) =>
        section._type === 'raceGroup'
          ? {
              ...section,
              races: (section.races ?? []).filter((race) => passesDistrictFilter(race.district, match)),
            }
          : section,
      ),
    }))
}
