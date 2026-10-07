import {cache} from 'react'

import {GUIDE_CACHE_TAG} from '@/lib/guideRevalidate'
import {normalizeGuidePayload, type GuidePayload} from '@/lib/guidePayload'
import {withTransientRetries} from '@/lib/transientFetch'
import {client} from '@/sanity/lib/client'
import {GUIDE_QUERY} from '@/sanity/lib/queries'

export type {GuidePayload}

/**
 * The whole published guide, via the one nested GROQ query. Pages that
 * call this should also set `export const revalidate = 300`. That timer
 * is the fallback; `app/api/revalidate` refreshes the same cache tag when
 * Studio content is saved. See docs/backend-strategy.md §13.
 *
 * Wrapped in React `cache()` so multiple callers on the same request
 * share one fetch. A dropped connection is retried a couple of times;
 * a missing project ID still fails immediately.
 *
 * `useCdn: false` is only on this fetch. The shared client still uses the
 * CDN, but a webhook refetch against apicdn.sanity.io can return the
 * previous document for a short time after a save. Next caches this
 * response (`revalidate` + `tags`), so visitors do not hit the API.
 */
export const getGuide = cache(async (): Promise<GuidePayload> => {
  const data = (await withTransientRetries(() =>
    client.fetch(GUIDE_QUERY, {}, {useCdn: false, next: {revalidate: 300, tags: [GUIDE_CACHE_TAG]}}),
  )) as {
    regions: GuidePayload['regions'] | null
    settings: GuidePayload['settings']
  } | null

  return normalizeGuidePayload(data)
})
