import {describe, expect, it} from 'vitest'

import {shareGuideText, shareGuideUrl} from '@/lib/shareGuide'

describe('shareGuide', () => {
  it('shares the guide home with the filled-in line', () => {
    expect(shareGuideUrl('https://example.org')).toBe('https://example.org/')
    expect(shareGuideUrl('https://example.org/guide/los-angeles')).toBe('https://example.org/')
    expect(shareGuideText('https://voterguide.example')).toBe(
      'I just used this Voter Guide! https://voterguide.example/',
    )
  })
})
