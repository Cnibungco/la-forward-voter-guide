import Link from 'next/link'

import {SectionGroup} from '@/components/SectionGroup'
import {DISTRICT_EMPTY} from '@/lib/copy'
import {districtHasContent} from '@/lib/districts'
import type {GuideDistrict} from '@/lib/types'

import styles from './RegionSection.module.css'

interface DistrictBlockProps {
  district: GuideDistrict
  /** `none` on the district's own page, where the shell already shows the title. */
  heading?: 'h2' | 'h3' | 'none'
  /** Link the title to the district page. Off on that page itself. */
  linkTitle?: boolean
}

/**
 * One special district: its name, the editor's description, and its
 * race and measure groups. Used on the district page, under a city,
 * and on a matched ballot.
 */
export function DistrictBlock({district, heading = 'h2', linkTitle = false}: DistrictBlockProps) {
  const HeadingTag = heading === 'none' ? null : heading
  const groupTag = heading === 'h3' ? 'h4' : heading === 'h2' ? 'h3' : 'h2'
  const title =
    linkTitle && district.slug ? (
      <Link href={`/districts/${district.slug}`} className={styles.titleLink}>
        {district.title}
      </Link>
    ) : (
      district.title
    )

  return (
    <section
      className={styles.section}
      id={district.slug ?? undefined}
      aria-labelledby={HeadingTag ? `${district._id}-heading` : undefined}
    >
      {HeadingTag && (
        <HeadingTag id={`${district._id}-heading`} className={styles.heading}>
          {title}
        </HeadingTag>
      )}
      {district.description && <p className={styles.description}>{district.description}</p>}
      {district.sections.map((section) => (
        <SectionGroup key={section._key} section={section} groupTag={groupTag} />
      ))}
      {!districtHasContent(district) && <p className={styles.empty}>{DISTRICT_EMPTY}</p>}
    </section>
  )
}
