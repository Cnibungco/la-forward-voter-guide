import Link from 'next/link'

import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {OUTSIDE_BODY, OUTSIDE_EYEBROW, OUTSIDE_TITLE} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {isLosAngelesCity, regionByTier} from '@/lib/regions'

import styles from './outside.module.css'

export const revalidate = 300

export const metadata = {
  title: 'Outside coverage · LA Forward Voter Guide',
}

export default async function OutsidePage() {
  const regions = await getGuide()
  const stateRegion = regionByTier(regions, 'state')
  const countyRegion = regionByTier(regions, 'county')
  const laCity = regions.find(isLosAngelesCity)

  return (
    <GuideShell
      regions={regions}
      title="Outside coverage"
      heading={
        <>
          <p className={styles.eyebrow}>{OUTSIDE_EYEBROW}</p>
          <h1 className={styles.title}>{OUTSIDE_TITLE}</h1>
        </>
      }
    >
      <p className={styles.body}>{OUTSIDE_BODY}</p>
      <div className={styles.links}>
        {stateRegion?.slug && (
          <Link href={`/guide/${stateRegion.slug}`} className={styles.link}>
            {stateRegion.title}
          </Link>
        )}
        {countyRegion?.slug && (
          <Link href={`/guide/${countyRegion.slug}`} className={styles.link}>
            {countyRegion.title}
          </Link>
        )}
        {laCity?.slug && (
          <Link href={`/guide/${laCity.slug}`} className={styles.link}>
            {laCity.title}
          </Link>
        )}
      </div>
      <Methodology />
    </GuideShell>
  )
}
