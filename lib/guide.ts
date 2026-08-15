import {client} from '@/sanity/lib/client'
import {GUIDE_QUERY} from '@/sanity/lib/queries'
import type {GuideRegion} from '@/lib/types'

/**
 * The whole published guide, via the one nested GROQ query. Pages that
 * call this should also set `export const revalidate = 300` so ISR stays
 * the cache strategy — see .cursor/rules/data-fetching.mdc.
 */
export async function getGuide(): Promise<GuideRegion[]> {
  return (await client.fetch(GUIDE_QUERY)) as GuideRegion[]
}
