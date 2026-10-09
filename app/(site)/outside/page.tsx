import Link from 'next/link'

import {ChangeAddress} from '@/components/ChangeAddress'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {OUTSIDE_BODY, OUTSIDE_EYEBROW, OUTSIDE_TITLE, SAMPLE_BALLOT_LABEL} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {isLosAngelesCity, regionByTier} from '@/lib/regions'
import {resolvedSampleBallotUrl, resolvedTrustStatement} from '@/lib/siteSettings'

import styles from './outside.module.css'

export const revalidate = 300

export const metadata = {
  title: 'Outside coverage · LA Forward Voter Guide',
}

export default async function OutsidePage() {
  const {regions, specialDistricts, settings} = await getGuide()
  const stateRegion = regionByTier(regions, 'state')
  const countyRegion = regionByTier(regions, 'county')
  const laCity = regions.find(isLosAngelesCity)
  const sampleBallotUrl = resolvedSampleBallotUrl(settings)

  return (
    <GuideShell
      regions={regions}
      districts={specialDistricts}
      title="Outside coverage"
      heading={
        <>
          <p className={styles.eyebrow}>{OUTSIDE_EYEBROW}</p>
          <h1 className={styles.title}>{OUTSIDE_TITLE}</h1>
        </>
      }
    >
      <p className={styles.body}>{OUTSIDE_BODY}</p>
      <div className={styles.change}>
        <ChangeAddress appearance="gold" />
      </div>
      <div className={styles.links}>
        {stateRegion?.slug && (
          <Link href={`/guide/${stateRegion.slug}`} className={`${styles.link} ${styles.jurisdiction}`}>
            {stateRegion.title}
          </Link>
        )}
        {countyRegion?.slug && (
          <Link href={`/guide/${countyRegion.slug}`} className={`${styles.link} ${styles.jurisdiction}`}>
            {countyRegion.title}
          </Link>
        )}
        {laCity?.slug && (
          <Link href={`/guide/${laCity.slug}`} className={`${styles.link} ${styles.jurisdiction}`}>
            {laCity.title}
          </Link>
        )}
        {sampleBallotUrl && (
          <a href={sampleBallotUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {SAMPLE_BALLOT_LABEL} ↗
          </a>
        )}
      </div>
      <Methodology trustStatement={resolvedTrustStatement(settings)} />
    </GuideShell>
  )
}
