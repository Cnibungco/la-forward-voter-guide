/** Data-cache tag for the one guide query. Invalidated by the Sanity webhook. */
export const GUIDE_CACHE_TAG = 'guide'

/** Static guide pages. Dynamic region pages use `GUIDE_DYNAMIC_PATH`. */
export const GUIDE_PATHS = ['/', '/cities', '/ballot', '/outside'] as const

export const GUIDE_DYNAMIC_PATH = '/guide/[slug]'

const GUIDE_DOCUMENT_TYPES = new Set([
  'region',
  'race',
  'measure',
  'entry',
  'specialDistrict',
  'siteSettings',
])

/** Documents whose save can change the public guide even with no contentStatus. */
const STRUCTURAL_TYPES = new Set(['region', 'specialDistrict', 'siteSettings'])

export type GuideWebhookBody = {
  _type?: unknown
  contentStatus?: unknown
  beforeStatus?: unknown
}

/**
 * Whether a signed Studio save should refresh the public guide.
 *
 * Region, special district, and site settings saves always count: city
 * ballots and the disclaimer live on those documents. A race, measure, or
 * entry that was already `draft` and is still `draft` does not — it is
 * hidden from `GUIDE_QUERY`. Publishing, unpublishing, and edits to
 * pending or published content do.
 *
 * Unknown or missing types refresh anyway, so a projection mistake hides
 * content for at most the 5-minute ISR fallback.
 */
export function shouldRefreshGuide(body: GuideWebhookBody | null): boolean {
  if (!body || typeof body !== 'object') return true

  const type = typeof body._type === 'string' ? body._type : undefined
  if (type && !GUIDE_DOCUMENT_TYPES.has(type)) return false
  if (!type || STRUCTURAL_TYPES.has(type)) return true
  if (body.contentStatus === 'draft' && body.beforeStatus === 'draft') return false
  return true
}
