import {describe, expect, it} from 'vitest'

import {raceRowLabel} from '@/lib/raceLabel'

describe('raceRowLabel', () => {
  it('uses the race title when it already includes the only candidate name', () => {
    expect(raceRowLabel({title: 'Mayor Karen Bass'}, {name: 'Karen Bass'}, [{name: 'Karen Bass'}])).toBe(
      'Mayor Karen Bass',
    )
  })

  it('joins title and name for a one-person race that does not mention them', () => {
    expect(raceRowLabel({title: 'Mayor'}, {name: 'Karen Bass'}, [{name: 'Karen Bass'}])).toBe('Mayor: Karen Bass')
  })

  it('falls back to the name when a one-person race has no title', () => {
    expect(raceRowLabel({title: ''}, {name: 'Karen Bass'}, [{name: 'Karen Bass'}])).toBe('Karen Bass')
  })

  it('lists names only when there is more than one candidate', () => {
    const entries = [{name: 'Alex'}, {name: 'Blair'}]
    expect(raceRowLabel({title: 'City Council District 1'}, entries[0], entries)).toBe('Alex')
    expect(raceRowLabel({title: 'City Council District 1'}, entries[1], entries)).toBe('Blair')
  })
})
