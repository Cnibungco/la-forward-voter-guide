import {isMatchBallotResult} from '@/lib/districtMatching'
import type {MatchBallotResult} from '@/lib/types'

/**
 * sessionStorage key for the district match only — never the street
 * address. Survives refresh in this tab; closing the tab clears it.
 * See docs/address-matching-strategy.md.
 */
export const MATCH_STORAGE_KEY = 'la-forward-voter-guide:match'

export function readStoredMatch(): MatchBallotResult | null {
  try {
    const raw = sessionStorage.getItem(MATCH_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isMatchBallotResult(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeStoredMatch(result: MatchBallotResult): void {
  try {
    sessionStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(result))
  } catch {
    // Private mode or quota — in-memory match still works for this visit.
  }
}

export function clearStoredMatch(): void {
  try {
    sessionStorage.removeItem(MATCH_STORAGE_KEY)
  } catch {
    // ignore
  }
}
