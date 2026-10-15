import {describe, expect, it} from 'vitest'

import {entryPhotoUrl} from '@/lib/image'
import type {SanityImageValue} from '@/lib/types'

function photo(ref: string): SanityImageValue {
  return {_type: 'image', asset: {_ref: ref, _type: 'reference'}}
}

describe('entryPhotoUrl', () => {
  it('asks Sanity for a display-sized poster, not the original file', () => {
    const url = new URL(entryPhotoUrl(photo('image-abc123-2400x3000-jpg')))

    expect(url.hostname).toBe('cdn.sanity.io')
    expect(url.searchParams.get('w')).toBe('960')
    expect(url.searchParams.get('h')).toBeNull()
    expect(url.searchParams.get('q')).toBe('75')
    expect(url.searchParams.get('auto')).toBe('format')
    expect(url.searchParams.get('rect')).toBeNull()
  })

  it('does not upscale a poster that is already smaller than the cap', () => {
    const url = new URL(entryPhotoUrl(photo('image-abc123-400x500-png')))
    expect(url.searchParams.get('w')).toBe('400')
  })
})
