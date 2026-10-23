/**
 * Build the one-line string we POST to /api/match-ballot from a Geoapify
 * autocomplete feature. Census's oneline parser is happier with
 * "housenumber street, city, ST ZIP" than Geoapify's `formatted` field,
 * which often appends neighborhood names and "United States of America".
 *
 * The address still never leaves the browser except on that one POST —
 * see docs/address-matching-strategy.md.
 */
export function censusAddressFromFeature(properties: unknown): string | null {
  if (!properties || typeof properties !== 'object') return null
  const props = properties as Record<string, unknown>

  const housenumber = stringProp(props.housenumber)
  const street = stringProp(props.street)
  const city = stringProp(props.city)
  const state = stringProp(props.state_code) ?? stringProp(props.state)
  const postcode = stringProp(props.postcode)

  const line = [housenumber, street].filter(Boolean).join(' ')
  if (line && city && state) {
    const region = [state, postcode].filter(Boolean).join(' ')
    return `${line}, ${city}, ${region}`
  }

  const formatted = stringProp(props.formatted)
  if (!formatted) return null
  return stripCountry(formatted) || null
}

export type AddressPick =
  | {kind: 'address'; address: string}
  | {kind: 'incomplete'}
  | {kind: 'empty'}

/**
 * A ballot is a house number on a street. Zips, neighborhoods, cities,
 * landmarks, PO Boxes, and street names alone are not. Geoapify's suggestion
 * for "90012" is a neighborhood ("Civic Center, Los Angeles, CA 90012"),
 * and a street with no number geocodes to whatever point Census picks along
 * it. Classify those before anything is sent.
 *
 * A formatted line still counts when it starts with a house number, so a
 * building Geoapify didn't split into parts can be matched.
 */
const COARSE_RESULT_TYPES = new Set([
  'postcode',
  'suburb',
  'city',
  'district',
  'county',
  'state',
  'country',
  'locality',
])

export function addressPickFromFeature(properties: unknown): AddressPick {
  if (!properties || typeof properties !== 'object') return {kind: 'empty'}
  const props = properties as Record<string, unknown>
  if (isCoarsePlace(props) || isPoBox(props)) return {kind: 'incomplete'}

  const address = censusAddressFromFeature(properties)
  if (address && hasHouseNumber(address)) return {kind: 'address', address}
  if (address || stringProp(props.street) || stringProp(props.postcode) || stringProp(props.result_type)) {
    return {kind: 'incomplete'}
  }
  return {kind: 'empty'}
}

/** "90012", "90012-1234", or "90012, Los Angeles, CA" — a ZIP with no street. */
export function isZipOnlyAddress(value: string): boolean {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (/^\d{5}(?:-\d{4})?$/.test(trimmed)) return true
  return /^\d{5}(?:-\d{4})?\s*,/.test(trimmed)
}

/**
 * A house number followed by a street word. Rejects a bare ZIP and
 * "90012, Los Angeles, CA". "90012 Santa Monica Blvd" still counts: the
 * five digits are the house number.
 */
export function hasHouseNumber(address: string): boolean {
  const trimmed = address.trim().replace(/\s+/g, ' ')
  if (!trimmed || isZipOnlyAddress(trimmed)) return false
  return /^\d+[A-Za-z]?(?:-\d+[A-Za-z]?)?\s+\S/.test(trimmed)
}

/** Zip, street-only, PO Box, or anything else with no house number. */
export function isIncompleteAddress(address: string): boolean {
  if (/\bP\.?\s*O\.?\s*Box\b/i.test(address)) return true
  return !hasHouseNumber(address)
}

/** Leading house number, keeping a single letter suffix so 200A is not 200. */
export function leadingHouseNumber(address: string): string | null {
  const match = address.trim().match(/^(\d+[A-Za-z]?)/)
  return match?.[1] ?? null
}

/**
 * Census may standardize the line ("200 N SPRING ST, ...") or leave the
 * number off the line and report the TIGER range it interpolated inside.
 * A match that names a different number is not this house. The number has
 * to lead the matched line: a zip at the end ("..., 90012") must not
 * confirm a house number of 90012.
 */
export function censusMatchConfirmsHouseNumber(
  submitted: string,
  matchedAddress: string | undefined,
  range?: {from?: string; to?: string},
): boolean {
  const house = houseToken(submitted)
  if (!house) return false

  const matched = matchedAddress ? houseToken(matchedAddress) : null
  if (matched) return sameHouse(house, matched)

  // No number on the matched line. A letter suffix cannot be checked
  // against a numeric TIGER range.
  if (house.suffix) return false
  const from = numberToken(range?.from)
  const to = numberToken(range?.to)
  if (from === null) return false
  const high = to ?? from
  const low = Math.min(from, high)
  const upper = Math.max(from, high)
  if (house.value < low || house.value > upper) return false
  // TIGER ranges stay on one side of the street, so they share a parity.
  return (house.value - from) % 2 === 0
}

function houseToken(address: string): {value: number; suffix: string} | null {
  const match = address.trim().match(/^(\d+)([A-Za-z]?)/)
  if (!match) return null
  const value = Number(match[1])
  if (!Number.isFinite(value)) return null
  return {value, suffix: match[2].toUpperCase()}
}

function sameHouse(submitted: {value: number; suffix: string}, matched: {value: number; suffix: string}): boolean {
  return submitted.value === matched.value && submitted.suffix === matched.suffix
}

function numberToken(value: string | undefined): number | null {
  const match = value?.trim().match(/^(\d+)/)
  if (!match) return null
  const parsed = Number(match[1])
  return Number.isFinite(parsed) ? parsed : null
}

function isCoarsePlace(props: Record<string, unknown>): boolean {
  const resultType = stringProp(props.result_type)?.toLowerCase()
  return resultType !== undefined && COARSE_RESULT_TYPES.has(resultType)
}

function isPoBox(props: Record<string, unknown>): boolean {
  return [props.street, props.address_line1, props.formatted, props.name].some(
    (part) => typeof part === 'string' && /\bP\.?\s*O\.?\s*Box\b/i.test(part),
  )
}

function stripCountry(formatted: string): string {
  return formatted.replace(/,?\s*United States( of America)?\s*$/i, '').trim()
}

function stringProp(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}
