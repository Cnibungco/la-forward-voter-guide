'use client'

import {useMemo, useState} from 'react'

import {AddressLookup} from '@/components/AddressLookup'
import {GuideNav} from '@/components/GuideNav'
import {RegionSection} from '@/components/RegionSection'
import {filterRegionsByMatch} from '@/lib/districtMatching'
import {TIER_LABELS} from '@/lib/labels'
import type {GuideRegion, MatchBallotResult, RegionTier} from '@/lib/types'

import styles from './GuideBody.module.css'

const TIER_ORDER: RegionTier[] = ['state', 'county', 'city']

interface GuideBodyProps {
  regions: GuideRegion[]
}

type LookupStatus = 'idle' | 'loading' | 'error'

/**
 * Owns the address-matching UI and filters the already-fetched
 * `regions` (from `GUIDE_QUERY`) client-side — this is the one place
 * `.cursor/rules/data-fetching.mdc`'s "no second Sanity query" promise
 * gets kept for this feature. See docs/address-matching-strategy.md.
 */
export function GuideBody({regions}: GuideBodyProps) {
  const [match, setMatch] = useState<MatchBallotResult | null>(null)
  const [status, setStatus] = useState<LookupStatus>('idle')
  const [showFullGuide, setShowFullGuide] = useState(false)

  async function handleAddressSelected(address: string) {
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
      const result = (await response.json()) as MatchBallotResult
      setMatch(result)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  const isFiltering = match !== null && match.precision !== 'none' && !showFullGuide

  const effectiveRegions = useMemo(() => {
    if (!match || !isFiltering) return regions
    return filterRegionsByMatch(regions, match)
  }, [regions, match, isFiltering])

  const matchedCityTitle =
    match?.citySlug != null ? regions.find((region) => region.slug === match.citySlug)?.title ?? null : null

  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    regions: effectiveRegions.filter((region) => region.tier === tier),
  })).filter(({regions: tierRegions}) => tierRegions.length > 0)

  return (
    <>
      <div className={styles.lookup}>
        <AddressLookup onSelect={handleAddressSelected} />
      </div>

      {status === 'loading' && <p className={styles.status}>Looking up your ballot…</p>}

      {status === 'error' && (
        <p className={styles.statusError}>
          Something went wrong looking up that address. Here&apos;s the full guide — you can browse for
          your races and measures below.
        </p>
      )}

      {status === 'idle' && match?.precision === 'none' && (
        <p className={styles.statusError}>
          We couldn&apos;t match that address to an LA County ballot. Here&apos;s the full guide — you can
          browse for your races and measures below.
        </p>
      )}

      {status === 'idle' && match && match.precision !== 'none' && (
        <div className={styles.statusBanner}>
          <p>
            {isFiltering
              ? match.precision === 'city' && matchedCityTitle
                ? `We don't have precise district boundaries for ${matchedCityTitle} yet, so we're showing its full ballot below — your state and county races are still narrowed to your address.`
                : 'Showing the races and measures that apply to your address below.'
              : 'Showing the full guide.'}
          </p>
          <button type="button" className={styles.toggle} onClick={() => setShowFullGuide((prev) => !prev)}>
            {isFiltering ? 'Show full guide' : 'Show my ballot again'}
          </button>
        </div>
      )}

      <GuideNav regions={effectiveRegions} />

      <main className={styles.main}>
        {tiers.length === 0 ? (
          <p className={styles.empty}>No races or measures match your address in the sections above.</p>
        ) : (
          tiers.map(({tier, regions: tierRegions}) => (
            <section key={tier} className={styles.tierSection} aria-labelledby={`${tier}-tier-heading`}>
              <h2 id={`${tier}-tier-heading`} className={styles.tierHeading}>
                {TIER_LABELS[tier]}
              </h2>
              {tierRegions.map((region) => (
                <RegionSection key={region._id} region={region} />
              ))}
            </section>
          ))
        )}
      </main>
    </>
  )
}
