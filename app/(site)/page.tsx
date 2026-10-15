import type {Metadata} from 'next'

import {Landing} from '@/components/Landing'
import {EMPTY_GUIDE_COPY} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {homeLinks} from '@/lib/shellPayload'
import {resolvedDisclaimer, resolvedHomeCopy, resolvedSampleBallotUrl} from '@/lib/siteSettings'

import styles from './page.module.css'

export const metadata: Metadata = {
  alternates: {canonical: '/'},
}

// Hourly fallback. The Sanity webhook refreshes this page on publish.
export const revalidate = 3600

export default async function LandingPage() {
  const {regions, settings} = await getGuide()

  if (regions.length === 0) {
    return <p className={styles.empty}>{EMPTY_GUIDE_COPY}</p>
  }

  return (
    <Landing
      links={homeLinks(regions)}
      sampleBallotUrl={resolvedSampleBallotUrl(settings)}
      disclaimer={resolvedDisclaimer(settings)}
      home={resolvedHomeCopy(settings)}
    />
  )
}
