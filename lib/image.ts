import createImageUrlBuilder from '@sanity/image-url'

import {dataset, projectId} from '@/sanity/lib/client'
import type {SanityImageValue} from '@/lib/types'

const builder = createImageUrlBuilder({projectId, dataset})

export function urlForImage(source: SanityImageValue) {
  return builder.image(source)
}

/**
 * Posters render at 249px in the card, or up to the viewport width on a
 * phone. 960 covers a 2x screen without asking Sanity for a multi‑megabyte
 * original. The browser loads this URL from cdn.sanity.io directly
 * (`unoptimized` on the image), so Vercel does not download and resize it.
 */
const POSTER_MAX_WIDTH = 960

/**
 * Entry photos are full endorsement posters. The crop and hotspot stored
 * on the image were set for a circular face avatar, so the display URL
 * must ignore them or the CDN clips the logo and name off the graphic.
 */
export function entryPhotoUrl(source: SanityImageValue): string {
  // ignoreImageParams drops the stored face crop so the full poster is shown.
  // Width only — a height would let the CDN crop to a box.
  const chain = builder.image(source).ignoreImageParams().auto('format').quality(75)
  const dims = imageAssetDimensions(source)
  const width = dims ? Math.min(dims.width, POSTER_MAX_WIDTH) : POSTER_MAX_WIDTH
  return chain.width(width).url()
}

/** Pixel size encoded in a Sanity asset ref (`image-{id}-{w}x{h}-{fmt}`). */
export function imageAssetDimensions(
  source: SanityImageValue,
): {width: number; height: number} | null {
  const ref = source.asset?._ref
  if (!ref) return null
  const match = /-(\d+)x(\d+)-/.exec(ref)
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return null
  return {width, height}
}
