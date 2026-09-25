import {describe, expect, it} from 'vitest'

import {redactAnalyticsEvent, stripQueryAndHash} from './analytics'

describe('stripQueryAndHash', () => {
  it('removes query string and hash from an absolute URL', () => {
    expect(
      stripQueryAndHash(
        'https://example.org/ballot?utm_source=email&address=123%20Main#top',
      ),
    ).toBe('https://example.org/ballot')
  })

  it('returns a non-URL path without query or hash', () => {
    expect(stripQueryAndHash('/guide/la?utm_campaign=nov-2026#races')).toBe(
      '/guide/la',
    )
  })
})

describe('redactAnalyticsEvent', () => {
  it('keeps pageviews with a clean URL', () => {
    expect(
      redactAnalyticsEvent({
        type: 'pageview',
        url: 'https://example.org/outside?utm_source=flyer',
      }),
    ).toEqual({type: 'pageview', url: 'https://example.org/outside'})
  })

  it('drops custom events so lookup text cannot be sent', () => {
    expect(
      redactAnalyticsEvent({
        type: 'event',
        url: 'https://example.org/',
      }),
    ).toBeNull()
  })
})
