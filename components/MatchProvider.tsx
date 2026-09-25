'use client'

import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react'

import {isMatchBallotResult} from '@/lib/districtMatching'
import {readStoredMatch, writeStoredMatch} from '@/lib/matchStorage'
import type {MatchBallotResult} from '@/lib/types'

export type LookupStatus = 'idle' | 'loading' | 'error'

export type LookupDestination = 'ballot' | 'outside' | 'error'

interface MatchContextValue {
  match: MatchBallotResult | null
  enteredAddress: string | null
  status: LookupStatus
  ready: boolean
  showFullGuide: boolean
  setShowFullGuide: (value: boolean | ((prev: boolean) => boolean)) => void
  lookupAddress: (address: string) => Promise<LookupDestination>
}

const MatchContext = createContext<MatchContextValue | null>(null)

/**
 * Holds the typed address in memory only. The district match (never the
 * street) is also mirrored to sessionStorage so a refresh keeps Your
 * ballot. Never localStorage, cookies, logs, or a database.
 * See docs/address-matching-strategy.md.
 */
export function MatchProvider({children}: {children: ReactNode}) {
  const [match, setMatch] = useState<MatchBallotResult | null>(null)
  const [enteredAddress, setEnteredAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<LookupStatus>('idle')
  const [showFullGuide, setShowFullGuide] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStoredMatch()
    if (stored) setMatch(stored)
    setReady(true)
  }, [])

  const lookupAddress = useCallback(async (address: string): Promise<LookupDestination> => {
    setStatus('loading')
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
      setEnteredAddress(address)
      writeStoredMatch(result)
      setStatus('idle')
      return result.precision === 'none' ? 'outside' : 'ballot'
    } catch {
      setStatus('error')
      return 'error'
    }
  }, [])

  const value = useMemo(
    () => ({match, enteredAddress, status, ready, showFullGuide, setShowFullGuide, lookupAddress}),
    [match, enteredAddress, status, ready, showFullGuide, lookupAddress],
  )

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
}

export function useMatch(): MatchContextValue {
  const context = useContext(MatchContext)
  if (!context) throw new Error('useMatch must be used within MatchProvider')
  return context
}
