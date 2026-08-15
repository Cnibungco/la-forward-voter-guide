'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useMemo} from 'react'

import {CompactLegend} from '@/components/CompactLegend'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {useMatch} from '@/components/MatchProvider'
import {RegionSection} from '@/components/RegionSection'
import {filterRegionsByMatch} from '@/lib/districtMatching'
import {TIER_LABELS} from '@/lib/labels'
import {regionMatchingCitySlug} from '@/lib/regions'
import type {GuideRegion, RegionTier} from '@/lib/types'

import styles from './GuideBody.module.css'

const TIER_ORDER: RegionTier[] = ['state', 'county', 'city']

interface GuideBodyProps {
  regions: GuideRegion[]
}

/**
 * "Your ballot" view. Owns the already-fetched `regions` (from
 * `GUIDE_QUERY`) and filters them client-side from the match result in
 * context — this is the one place .cursor/rules/data-fetching.mdc's
 * "no second Sanity query" promise gets kept for this feature. See
 * docs/address-matching-strategy.md.
 */
export function GuideBody({regions}: GuideBodyProps) {
  const router = useRouter()
  const {match, status, showFullGuide, setShowFullGuide} = useMatch()

  useEffect(() => {
    if (status === 'loading') return
    if (!match) {
      router.replace('/')
      return
    }
    if (match.precision === 'none') router.replace('/outside')
  }, [match, status, router])

  const isFiltering = match !== null && match.precision !== 'none' && !showFullGuide

  const effectiveRegions = useMemo(() => {
    if (!match || !isFiltering) return regions
    return filterRegionsByMatch(regions, match)
  }, [regions, match, isFiltering])

  const matchedCity = match ? regionMatchingCitySlug(regions, match.citySlug) : undefined
  const matchedCityTitle = matchedCity?.title ?? null

  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    regions: effectiveRegions.filter((region) => region.tier === tier),
  })).filter(({regions: tierRegions}) => tierRegions.length > 0)

  if (!match || match.precision === 'none') return null

  return (
    <GuideShell
      regions={regions}
      title="Your ballot"
      crumb="Your ballot"
      activeSlug={matchedCity?.slug ?? match.citySlug}
    >
      <div className={styles.statusBanner}>
        <p>
          {isFiltering
            ? match.precision === 'city' && matchedCityTitle
              ? `We don't have precise district boundaries for ${matchedCityTitle} yet, so we're showing its full ballot below. Your state and county races are still narrowed to your address.`
              : 'Showing the races and measures that apply to your address below.'
            : 'Showing the full guide.'}
        </p>
        <button type="button" className={styles.toggle} onClick={() => setShowFullGuide((prev) => !prev)}>
          {isFiltering ? 'Show full guide' : 'Show my ballot again'}
        </button>
      </div>

      <Methodology />
      <CompactLegend />

      {tiers.length === 0 ? (
        <p className={styles.empty}>No races or measures match your address in this guide.</p>
      ) : (
        tiers.map(({tier, regions: tierRegions}) => (
          <section key={tier} className={styles.tierSection} aria-labelledby={`${tier}-tier-heading`}>
            <h2 id={`${tier}-tier-heading`} className={styles.tierHeading}>
              {TIER_LABELS[tier]}
            </h2>
            {tierRegions.map((region) => (
              <RegionSection key={region._id} region={region} headingLevel="h3" />
            ))}
          </section>
        ))
      )}
    </GuideShell>
  )
}
