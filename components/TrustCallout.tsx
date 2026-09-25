import {TRUST_STATEMENT} from '@/lib/copy'

import styles from './TrustCallout.module.css'

export function TrustCallout() {
  return <p className={styles.callout}>{TRUST_STATEMENT}</p>
}
