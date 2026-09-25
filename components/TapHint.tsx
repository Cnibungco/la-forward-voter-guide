import {TAP_HINT} from '@/lib/copy'

import styles from './TapHint.module.css'

export function TapHint({children = TAP_HINT}: {children?: string}) {
  return <p className={styles.hint}>{children}</p>
}
