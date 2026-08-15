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
  return formatted.replace(/,?\s*United States( of America)?\s*$/i, '').trim() || null
}

function stringProp(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}
