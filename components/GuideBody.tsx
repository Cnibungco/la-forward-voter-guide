'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useMemo} from 'react'

import {ChangeAddress} from '@/components/ChangeAddress'
import {Cta} from '@/components/Cta'
import {CompactLegend} from '@/components/CompactLegend'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {useMatch} from '@/components/MatchProvider'
import {RegionSection} from '@/components/RegionSection'
import {TapHint} from '@/components/TapHint'
import {filterRegionsByMatch} from '@/lib/districtMatching'
import {expandableContentKind} from '@/lib/contentStatus'
import {
  BALLOT_ADDRESS_PREFIX,
  BALLOT_EMPTY,
  BALLOT_FILTERING_COPY,
  BALLOT_FULL_COPY,
  SHOW_EVERYTHING_LABEL,
  SHOW_ONLY_MY_BALLOT_LABEL,
  TAP_HINT,
  TAP_HINT_MEASURE,
  ballotCityImprecision,
} from '@/lib/copy'
import {BALLOT_TIER_LABELS} from '@/lib/labels'
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
  const {match, enteredAddress, ready, showFullGuide, setShowFullGuide} = useMatch()

  useEffect(() => {
    if (!ready) return
    if (!match) {
      router.replace('/')
      return
    }
    if (match.precision === 'none') router.replace('/outside')
  }, [match, ready, router])

  const isFiltering = match !== null && match.precision !== 'none' && !showFullGuide

  const effectiveRegions = useMemo(() => {
    if (!match || !isFiltering) return regions
    return filterRegionsByMatch(regions, match)
  }, [regions, match, isFiltering])

  const hintKind = expandableContentKind(effectiveRegions)
  const matchedCity = match ? regionMatchingCitySlug(regions, match.citySlug) : undefined
  const matchedCityTitle = matchedCity?.title ?? null

  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    regions: effectiveRegions.filter((region) => region.tier === tier),
  })).filter(({regions: tierRegions}) => tierRegions.length > 0)

  if (!ready || !match || match.precision === 'none') return null

  return (
    <GuideShell
      regions={regions}
      title="Your ballot"
      crumb="Your ballot"
      activeSlug={matchedCity?.slug ?? match.citySlug}
      showBackToTop
    >
      <div className={styles.statusBanner}>
        <div className={styles.statusCopy}>
          {enteredAddress && (
            <p className={styles.addressLine}>
              {BALLOT_ADDRESS_PREFIX}{' '}
              <span className={`${styles.address} notranslate`} translate="no">
                {enteredAddress}
              </span>
            </p>
          )}
          <p>
            {isFiltering
              ? match.precision === 'city' && matchedCityTitle
                ? ballotCityImprecision(matchedCityTitle)
                : BALLOT_FILTERING_COPY
              : BALLOT_FULL_COPY}
          </p>
          <ChangeAddress />
        </div>
        <Cta
          variant="secondary"
          size="compact"
          className={styles.filterToggle}
          onClick={() => setShowFullGuide((prev) => !prev)}
        >
          {isFiltering ? SHOW_EVERYTHING_LABEL : SHOW_ONLY_MY_BALLOT_LABEL}
        </Cta>
      </div>

      <Methodology />
      <CompactLegend />
      {hintKind && <TapHint>{hintKind === 'measure' ? TAP_HINT_MEASURE : TAP_HINT}</TapHint>}

      {tiers.length === 0 ? (
        <p className={styles.empty}>{BALLOT_EMPTY}</p>
      ) : (
        tiers.map(({tier, regions: tierRegions}) => (
          <section key={tier} className={styles.tierSection} aria-labelledby={`${tier}-tier-heading`}>
            <h2 id={`${tier}-tier-heading`} className={styles.tierHeading}>
              {BALLOT_TIER_LABELS[tier]}
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
