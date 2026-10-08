import {describe, expect, it} from 'vitest'

import {displayedRaceTitle, raceRowLabel, raceTitleRepeatsGroup} from '@/lib/raceLabel'

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

describe('raceTitleRepeatsGroup', () => {
  it('treats an exact group repeat as redundant', () => {
    expect(raceTitleRepeatsGroup('City Council', 'City Council')).toBe(true)
  })

  it('treats an at-large qualifier as redundant', () => {
    expect(raceTitleRepeatsGroup('City Council (At-Large)', 'City Council')).toBe(true)
    expect(raceTitleRepeatsGroup('City Council - At Large', 'CITY COUNCIL')).toBe(true)
  })

  it('keeps a district title under the same group', () => {
    expect(raceTitleRepeatsGroup('City Council District 4', 'City Council')).toBe(false)
    expect(raceTitleRepeatsGroup('Council District 4', 'City Council')).toBe(false)
  })

  it('keeps a title that has no group to compare with', () => {
    expect(raceTitleRepeatsGroup('Mayor', undefined)).toBe(false)
    expect(displayedRaceTitle('City Council (At-Large)', 'City Council')).toBe('')
    expect(displayedRaceTitle('Council District 4', 'City Council')).toBe('Council District 4')
  })
})
