import Image from 'next/image'

import {ComingSoonRow} from '@/components/ComingSoonRow'
import {PortableText} from '@/components/PortableText'
import {RatingBadge} from '@/components/RatingBadge'
import {entryNeedsWriteup, isDraftStatus} from '@/lib/contentStatus'
import {ENTRY_NO_REASONING} from '@/lib/copy'
import {urlForImage} from '@/lib/image'
import type {GuideEntry} from '@/lib/types'

import styles from './Accordion.module.css'
import cardStyles from './EntryCard.module.css'

interface EntryCardProps {
  entry: GuideEntry
  label: string
}

export function EntryCard({entry, label}: EntryCardProps) {
  if (isDraftStatus(entry.contentStatus)) return null
  if (entryNeedsWriteup(entry)) {
    return <ComingSoonRow title={label} id={entry.slug} />
  }

  const photoUrl = entry.photo ? urlForImage(entry.photo).width(160).height(160).fit('crop').url() : null

  return (
    <details className={styles.row} id={entry.slug ?? undefined}>
      <summary className={styles.summary}>
        <span className={styles.label}>{label}</span>
        {entry.rating && <RatingBadge kind={entry.rating} />}
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <div className={photoUrl ? `${styles.panel} ${styles.withPhoto}` : styles.panel}>
        {photoUrl && (
          <Image
            className={cardStyles.photo}
            src={photoUrl}
            alt={entry.name}
            width={64}
            height={64}
          />
        )}
        {entry.reasoning ? (
          <div className={cardStyles.reasoning}>
            <PortableText value={entry.reasoning} />
          </div>
        ) : (
          <p className={styles.empty}>{ENTRY_NO_REASONING}</p>
        )}
      </div>
    </details>
  )
}
