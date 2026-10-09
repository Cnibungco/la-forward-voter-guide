import {CAMPAIGN_DISCLAIMER} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {resolvedCampaignDonor} from '@/lib/siteSettings'

import styles from './CampaignDisclaimer.module.css'

export async function CampaignDisclaimer() {
  const {settings} = await getGuide()
  const copy = {...CAMPAIGN_DISCLAIMER, donor: resolvedCampaignDonor(settings)}

  return (
    <div className={styles.disclaimer}>
      <p className={styles.line}>
        <span className={styles.underlined}>{copy.paidForPrefix}</span>
        <a href={copy.addressHref} target="_blank" rel="noopener noreferrer">
          {copy.address}
        </a>
      </p>
      <p className={`${styles.line} ${styles.underlined}`}>{copy.majorFundingBy}</p>
      <p className={styles.line}>{copy.donor}</p>
      <p className={`${styles.line} ${styles.underlined}`}>{copy.notAuthorized}</p>
      <p className={styles.line}>
        <span className={styles.underlined}>{copy.fundingDetailsPrefix}</span>
        <a href={copy.ethicsHref} target="_blank" rel="noopener noreferrer">
          {copy.ethicsLabel}
        </a>
      </p>
    </div>
  )
}
