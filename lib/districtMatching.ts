import {citySlugsMatch} from '@/lib/regions'
import type {GuideRegion, MatchBallotResult} from '@/lib/types'

export function isMatchBallotResult(value: unknown): value is MatchBallotResult {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const precision = record.precision
  return (
    (precision === 'precise' || precision === 'city' || precision === 'none') &&
    (record.citySlug === null || typeof record.citySlug === 'string') &&
    Array.isArray(record.districtCodes) &&
    record.districtCodes.every((code) => typeof code === 'string')
  )
}

/**
 * The leading letters of a district code, e.g. `"CD4"` -> `"CD"`. Trimmed
 * and uppercased so stray whitespace or a lowercase typo in a CMS field
 * (this is free text, not an enum — see
 * studio-la-forward-voter-guide/.cursor/rules/sanity-schema.mdc) doesn't
 * silently fail to match.
 */
function districtPrefix(code: string): string {
  return code.trim().match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? ''
}

/**
 * Which district-code prefixes this match result can actually be trusted
 * to filter by — derived directly from the prefixes present in
 * `result.districtCodes`, i.e. the layers that *actually resolved* a code
 * for this address, not just the layers we have boundary files for. This
 * matters for graceful degradation: if a city's council boundary is
 * sourced but this particular point didn't land inside any of its
 * polygons (a gap/edge case in the source data), `CC` simply won't appear
 * here, and `passesDistrictFilter` will correctly treat it as
 * unverifiable rather than hiding every council race. Anything outside
 * this set (school board sub-districts, community college trustee areas,
 * most cities' council districts — none of that boundary data is sourced
 * yet) is likewise treated as "unknown" rather than "no match".
 */
export function coverablePrefixesFor(result: MatchBallotResult): readonly string[] {
  if (result.precision === 'none') return []
  return [...new Set(result.districtCodes.map(districtPrefix))]
}

/**
 * Should a race/measure with this `district` code be shown for a given
 * match result? Never hides content on a boundary layer we haven't
 * sourced (or that failed to resolve for this address) — see
 * docs/address-matching-strategy.md's graceful-degradation requirement. A
 * district code only hides content when we affirmatively resolved that
 * layer for this address *and* it didn't match. Comparison is
 * case/whitespace-insensitive throughout — `district` is free-typed CMS
 * text (see studio-la-forward-voter-guide/.cursor/rules/sanity-schema.mdc),
 * so a `"cc14"` in Studio should still match the `"CC14"`
 * `app/api/match-ballot/route.ts` produces.
 */
export function passesDistrictFilter(district: string | null, result: MatchBallotResult): boolean {
  const trimmed = district?.trim().toUpperCase()
  if (!trimmed) return true // at-large / citywide — always shown once its Region is in view
  if (result.precision === 'none') return true
  if (result.districtCodes.some((code) => code.toUpperCase() === trimmed)) return true
  return !coverablePrefixesFor(result).includes(districtPrefix(trimmed))
}

/**
 * Census's `Incorporated Places` names ("Los Angeles", "Long Beach") into
 * the kebab-case slug convention used by `region.slug` in this app (see
 * `schemaTypes/region.ts` — slugs are generated from `title` with the same
 * shape). No hardcoded city list to maintain: any city Census resolves
 * that also happens to have a matching Region slug in Sanity will match
 * automatically.
 *
 * Diacritics are transliterated to their base letter (NFD-normalize, drop
 * combining marks) *before* stripping non-alphanumerics, so e.g. Census's
 * "La Cañada Flintridge" and a Sanity slug of "la-canada-flintridge"
 * (the conventional, ASCII spelling almost anyone would type) both land
 * on the same string. Without this step "ñ" would simply be deleted
 * rather than folded to "n", producing "la-ca-ada-flintridge" instead —
 * a real city this app covers, so this isn't a hypothetical.
 */
export function slugifyPlaceName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
    .filter((region) => region.tier !== 'city' || citySlugsMatch(region.slug, match.citySlug))
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
