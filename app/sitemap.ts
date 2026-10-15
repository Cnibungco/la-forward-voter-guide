import type {MetadataRoute} from 'next'

import {getGuide} from '@/lib/guide'
import {absoluteUrl, guideSitemap} from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guide = await getGuide()
  return guideSitemap(guide).map(({path, lastModified}) => ({
    url: absoluteUrl(path),
    ...(lastModified ? {lastModified} : {}),
  }))
}
