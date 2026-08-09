import Image from 'next/image'

import {PortableText} from '@/components/PortableText'
import {RatingBadge} from '@/components/RatingBadge'
import {urlForImage} from '@/lib/image'
import {RATING_LABELS, RATING_TONE} from '@/lib/labels'
import type {GuideEntry} from '@/lib/types'

import styles from './EntryCard.module.css'

interface EntryCardProps {
  entry: GuideEntry
}

export function EntryCard({entry}: EntryCardProps) {
  const photoUrl = entry.photo ? urlForImage(entry.photo).width(160).height(160).fit('crop').url() : null

  return (
    <li className={styles.card} id={entry.slug ?? undefined}>
      {photoUrl ? (
        <Image
          className={styles.photo}
          src={photoUrl}
          alt=""
          width={64}
          height={64}
        />
      ) : (
        <div className={styles.photoPlaceholder} aria-hidden="true" />
      )}
      <div className={styles.body}>
        <div className={styles.heading}>
          <span className={styles.name}>{entry.name}</span>
          {entry.rating && <RatingBadge label={RATING_LABELS[entry.rating]} tone={RATING_TONE[entry.rating]} />}
        </div>
        <div className={styles.reasoning}>
          <PortableText value={entry.reasoning} />
        </div>
      </div>
    </li>
  )
}
