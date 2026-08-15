'use client'

import {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from 'react'

import {isMatchBallotResult} from '@/lib/districtMatching'
import type {MatchBallotResult} from '@/lib/types'

export type LookupStatus = 'idle' | 'loading' | 'error'

export type LookupDestination = 'ballot' | 'outside' | 'error'

interface MatchContextValue {
  match: MatchBallotResult | null
  status: LookupStatus
  showFullGuide: boolean
  setShowFullGuide: (value: boolean | ((prev: boolean) => boolean)) => void
  lookupAddress: (address: string) => Promise<LookupDestination>
}

const MatchContext = createContext<MatchContextValue | null>(null)

/**
 * Holds the address-match result in memory only — never the address
 * itself, and never sessionStorage/localStorage. A refresh clears it.
 * See docs/address-matching-strategy.md.
 */
export function MatchProvider({children}: {children: ReactNode}) {
  const [match, setMatch] = useState<MatchBallotResult | null>(null)
  const [status, setStatus] = useState<LookupStatus>('idle')
  const [showFullGuide, setShowFullGuide] = useState(false)

  const lookupAddress = useCallback(async (address: string): Promise<LookupDestination> => {
    setStatus('loading')
    setMatch(null)
    setShowFullGuide(false)

    try {
      const response = await fetch('/api/match-ballot', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({address}),
      })
      if (!response.ok) throw new Error('match-ballot request failed')
      const result: unknown = await response.json()
      if (!isMatchBallotResult(result)) throw new Error('match-ballot response was malformed')
      setMatch(result)
      setStatus('idle')
      return result.precision === 'none' ? 'outside' : 'ballot'
    } catch {
      setStatus('error')
      return 'error'
    }
  }, [])

  const value = useMemo(
    () => ({match, status, showFullGuide, setShowFullGuide, lookupAddress}),
    [match, status, showFullGuide, lookupAddress],
  )

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
}

export function useMatch(): MatchContextValue {
  const context = useContext(MatchContext)
  if (!context) throw new Error('useMatch must be used within MatchProvider')
  return context
}
