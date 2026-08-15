import {Landing} from '@/components/Landing'
import {TrustBar} from '@/components/TrustBar'
import {getGuide} from '@/lib/guide'
import {resolvedDisclaimer, resolvedSampleBallotUrl} from '@/lib/siteSettings'

import styles from './page.module.css'

// Time-based revalidation per confirmed decision — no webhook to maintain.
export const revalidate = 300

export default async function LandingPage() {
  const {regions, settings} = await getGuide()

  if (regions.length === 0) {
    return (
      <p className={styles.empty}>
        No content has been published yet. Once regions, races, and measures are added in Studio,
        they&apos;ll show up here.
      </p>
    )
  }

  return (
    <>
      <TrustBar />
      <Landing
        regions={regions}
        sampleBallotUrl={resolvedSampleBallotUrl(settings)}
        disclaimer={resolvedDisclaimer(settings)}
      />
    </>
  )
}
