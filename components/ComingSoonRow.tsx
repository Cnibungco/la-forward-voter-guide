import {COMING_SOON_LABEL} from '@/lib/copy'

import styles from './Accordion.module.css'

interface ComingSoonRowProps {
  title: string
  id?: string | null
}

/** Ballot item that's confirmed but not yet written up — no rating, no reasoning. */
export function ComingSoonRow({title, id}: ComingSoonRowProps) {
  return (
    <div className={styles.row} id={id ?? undefined}>
      <div className={styles.pendingRow}>
        {title ? <span className={styles.label}>{title}</span> : null}
        <span className={styles.comingSoon}>{COMING_SOON_LABEL}</span>
      </div>
    </div>
  )
}
