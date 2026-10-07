import {describe, expect, it} from 'vitest'

import {shouldRefreshGuide} from '@/lib/guideRevalidate'

describe('shouldRefreshGuide', () => {
  it('refreshes when an entry is set to published', () => {
    expect(
      shouldRefreshGuide({
        _type: 'entry',
        contentStatus: 'published',
        beforeStatus: 'draft',
      }),
    ).toBe(true)
  })

  it('refreshes an edit to content that is already published or pending', () => {
    expect(shouldRefreshGuide({_type: 'race', contentStatus: 'published', beforeStatus: 'published'})).toBe(
      true,
    )
    expect(shouldRefreshGuide({_type: 'measure', contentStatus: 'pending', beforeStatus: 'pending'})).toBe(
      true,
    )
  })

  it('refreshes an unpublish so the public guide hides the item', () => {
    expect(shouldRefreshGuide({_type: 'entry', contentStatus: 'draft', beforeStatus: 'published'})).toBe(
      true,
    )
  })

  it('skips a draft that was already a draft', () => {
    expect(shouldRefreshGuide({_type: 'entry', contentStatus: 'draft', beforeStatus: 'draft'})).toBe(false)
  })

  it('refreshes region, special district, and site settings saves', () => {
    expect(shouldRefreshGuide({_type: 'region'})).toBe(true)
    expect(shouldRefreshGuide({_type: 'specialDistrict'})).toBe(true)
    expect(shouldRefreshGuide({_type: 'siteSettings'})).toBe(true)
  })

  it('ignores document types the guide does not render', () => {
    expect(shouldRefreshGuide({_type: 'sanity.imageAsset'})).toBe(false)
  })

  it('refreshes when the projection is missing the type, so a mistake waits at most 5 minutes', () => {
    expect(shouldRefreshGuide({})).toBe(true)
    expect(shouldRefreshGuide(null)).toBe(true)
  })
})
