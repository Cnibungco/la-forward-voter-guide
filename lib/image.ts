import createImageUrlBuilder from '@sanity/image-url'

import {dataset, projectId} from '@/sanity/lib/client'
import type {SanityImageValue} from '@/lib/types'

const builder = createImageUrlBuilder({projectId, dataset})

export function urlForImage(source: SanityImageValue) {
  return builder.image(source)
}
