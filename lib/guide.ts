import {cache} from 'react'

import {client} from '@/sanity/lib/client'
import {GUIDE_QUERY} from '@/sanity/lib/queries'
import {normalizeGuidePayload, type GuidePayload} from '@/lib/guidePayload'

export type {GuidePayload}

/**
 * The whole published guide, via the one nested GROQ query. Pages that
 * call this should also set `export const revalidate = 300` so ISR stays
 * the cache strategy — see .cursor/rules/data-fetching.mdc.
 *
 * Wrapped in React `cache()` so multiple callers on the same request
 * share one fetch.
 */
export const getGuide = cache(async (): Promise<GuidePayload> => {
  const data = (await client.fetch(GUIDE_QUERY)) as {
    regions: GuidePayload['regions'] | null
    settings: GuidePayload['settings']
  } | null

  return normalizeGuidePayload(data)
})
