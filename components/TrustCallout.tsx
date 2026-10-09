import {TRUST_STATEMENT} from '@/lib/copy'

import styles from './TrustCallout.module.css'

export function TrustCallout({statement = TRUST_STATEMENT}: {statement?: string}) {
  return <p className={styles.callout}>{statement}</p>
}
