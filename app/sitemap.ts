import type {MetadataRoute} from 'next'

import {getGuide} from '@/lib/guide'
import {absoluteUrl, publicGuidePaths} from '@/lib/seo'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {regions, specialDistricts} = await getGuide()
  return publicGuidePaths(regions, specialDistricts).map((path) => ({
    url: absoluteUrl(path),
  }))
}
