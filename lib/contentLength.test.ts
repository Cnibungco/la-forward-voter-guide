import {describe, expect, it} from 'vitest'

import {LONG_PAGE_VIEWPORTS, isLongPage} from '@/lib/contentLength'

describe('isLongPage', () => {
  it('hides on short pages and shows once content is past the viewport threshold', () => {
    expect(isLongPage(800, 800)).toBe(false)
    expect(isLongPage(800 * LONG_PAGE_VIEWPORTS, 800)).toBe(false)
    expect(isLongPage(800 * LONG_PAGE_VIEWPORTS + 1, 800)).toBe(true)
  })

  it('rejects a zero viewport so the link never flashes on an unmeasured page', () => {
    expect(isLongPage(4000, 0)).toBe(false)
  })
})
