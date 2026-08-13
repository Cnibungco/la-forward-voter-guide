import Link from 'next/link'

import {GuideBody} from '@/components/GuideBody'
import type {GuideRegion} from '@/lib/types'
import {client} from '@/sanity/lib/client'
import {GUIDE_QUERY} from '@/sanity/lib/queries'

import styles from './page.module.css'

// Time-based revalidation per confirmed decision — no webhook to maintain.
// This page is statically generated at build time against a real Sanity
// project and revalidated in the background every 5 minutes.
export const revalidate = 300

export default async function GuidePage() {
  const regions = (await client.fetch(GUIDE_QUERY)) as GuideRegion[]

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
        {regions.length === 0 ? (
          <p className={styles.empty}>
            No content has been published yet. Once regions, races, and measures are added in{' '}
            <Link href="/studio">Studio</Link>, they&apos;ll show up here.
          </p>
        ) : (
          // Client component: owns the address-lookup UI and filters this
          // already-fetched data — see docs/address-matching-strategy.md.
          // Data fetching stays server-side/ISR; only the rendering below
          // this point is interactive.
          <GuideBody regions={regions} />
        )}
      </div>
    </div>
  )
}
