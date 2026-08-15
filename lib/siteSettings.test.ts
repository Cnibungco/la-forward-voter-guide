import {describe, expect, it} from 'vitest'

import {DEFAULT_DISCLAIMER} from '@/lib/copy'
import {resolvedDisclaimer, resolvedSampleBallotUrl} from '@/lib/siteSettings'

describe('resolvedDisclaimer', () => {
  it('falls back when settings are missing or whitespace', () => {
    expect(resolvedDisclaimer(null)).toBe(DEFAULT_DISCLAIMER)
    expect(resolvedDisclaimer({disclaimer: '   ', sampleBallotUrl: null})).toBe(DEFAULT_DISCLAIMER)
  })

  it('uses the CMS string after trimming', () => {
    expect(resolvedDisclaimer({disclaimer: '  City races only.  ', sampleBallotUrl: null})).toBe('City races only.')
  })
})

describe('resolvedSampleBallotUrl', () => {
  it('returns null for missing or whitespace URLs', () => {
    expect(resolvedSampleBallotUrl(null)).toBeNull()
    expect(resolvedSampleBallotUrl({disclaimer: null, sampleBallotUrl: '  '})).toBeNull()
  })

  it('returns a trimmed URL', () => {
    expect(resolvedSampleBallotUrl({disclaimer: null, sampleBallotUrl: '  https://lavote.gov/sample  '})).toBe(
      'https://lavote.gov/sample',
    )
  })
})
