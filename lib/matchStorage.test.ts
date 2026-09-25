import {afterEach, describe, expect, it} from 'vitest'

import {clearStoredMatch, MATCH_STORAGE_KEY, readStoredMatch, writeStoredMatch} from '@/lib/matchStorage'
import type {MatchBallotResult} from '@/lib/types'

const PRECISE: MatchBallotResult = {
  precision: 'precise',
  citySlug: 'los-angeles',
  districtCodes: ['CD34', 'SD24', 'AD52'],
}

describe('matchStorage', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('round-trips a match result without extra fields', () => {
    writeStoredMatch(PRECISE)
    expect(readStoredMatch()).toEqual(PRECISE)
    expect(sessionStorage.getItem(MATCH_STORAGE_KEY)).not.toContain('Spring')
  })

  it('returns null for missing, malformed, or incomplete JSON', () => {
    expect(readStoredMatch()).toBeNull()
    sessionStorage.setItem(MATCH_STORAGE_KEY, '{')
    expect(readStoredMatch()).toBeNull()
    sessionStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify({precision: 'precise'}))
    expect(readStoredMatch()).toBeNull()
  })

  it('clears the stored match', () => {
    writeStoredMatch(PRECISE)
    clearStoredMatch()
    expect(readStoredMatch()).toBeNull()
  })
})
