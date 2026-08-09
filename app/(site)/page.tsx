import Link from 'next/link'

import {GuideNav} from '@/components/GuideNav'
import {RegionSection} from '@/components/RegionSection'
import {TIER_LABELS} from '@/lib/labels'
import type {GuideRegion, RegionTier} from '@/lib/types'
import {client} from '@/sanity/lib/client'
import {GUIDE_QUERY} from '@/sanity/lib/queries'

import styles from './page.module.css'

// Time-based revalidation per confirmed decision — no webhook to maintain.
// This page is statically generated at build time against a real Sanity
// project and revalidated in the background every 5 minutes.
export const revalidate = 300

const TIER_ORDER: RegionTier[] = ['state', 'county', 'city']

export default async function GuidePage() {
  const regions = (await client.fetch(GUIDE_QUERY)) as GuideRegion[]

  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    regions: regions.filter((region) => region.tier === tier),
  })).filter(({regions: tierRegions}) => tierRegions.length > 0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.brand}>LA Forward</p>
          <h1 className={styles.title}>Voter Guide</h1>
          <p className={styles.tagline}>
            Endorsements and analysis for upcoming races and ballot measures.
          </p>
        </div>
      </header>

      <div className={styles.container}>
        <GuideNav regions={regions} />

        <main className={styles.main}>
          {tiers.length === 0 ? (
            <p className={styles.empty}>
              No content has been published yet. Once regions, races, and measures are added in{' '}
              <Link href="/studio">Studio</Link>, they&apos;ll show up here.
            </p>
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
      </div>
    </div>
  )
}
