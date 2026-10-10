import type {Metadata} from 'next'

import {Landing} from '@/components/Landing'
import {EMPTY_GUIDE_COPY} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {resolvedDisclaimer, resolvedHomeCopy, resolvedSampleBallotUrl} from '@/lib/siteSettings'

import styles from './page.module.css'

export const metadata: Metadata = {
  alternates: {canonical: '/'},
}

// 5-minute ISR fallback. The Sanity webhook also revalidates this page on publish.
export const revalidate = 300

export default async function LandingPage() {
  const {regions, settings} = await getGuide()

  if (regions.length === 0) {
    return <p className={styles.empty}>{EMPTY_GUIDE_COPY}</p>
  }

  return (
    <Landing
      regions={regions}
      sampleBallotUrl={resolvedSampleBallotUrl(settings)}
      disclaimer={resolvedDisclaimer(settings)}
      home={resolvedHomeCopy(settings)}
    />
  )
}
