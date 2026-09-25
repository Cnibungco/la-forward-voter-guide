import {Landing} from '@/components/Landing'
import {EMPTY_GUIDE_COPY} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {resolvedDisclaimer, resolvedSampleBallotUrl} from '@/lib/siteSettings'

import styles from './page.module.css'

// Time-based revalidation per confirmed decision — no webhook to maintain.
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
    />
  )
}
