import {MeasureAccordion} from '@/components/MeasureAccordion'
import {RaceAccordion} from '@/components/RaceAccordion'
import {GroupLabel, SectionGroup} from '@/components/SectionGroup'
import {MEASURES_LABEL, RACES_LABEL, REGION_EMPTY} from '@/lib/copy'
import type {GuideRegion} from '@/lib/types'

import styles from './RegionSection.module.css'

interface RegionSectionProps {
  region: GuideRegion
  headingLevel?: 'h3' | 'none'
  /** A city page with school districts below should not say the region is empty. */
  suppressEmpty?: boolean
}

export function RegionSection({region, headingLevel = 'none', suppressEmpty = false}: RegionSectionProps) {
  const sections = region.sections ?? []
  const hasContent = region.races.length > 0 || region.measures.length > 0 || sections.length > 0
  const groupTag = headingLevel === 'h3' ? 'h4' : 'h2'

  return (
    <section
      className={styles.section}
      id={region.slug ?? undefined}
      aria-labelledby={headingLevel === 'none' ? undefined : `${region.slug}-heading`}
    >
      {headingLevel !== 'none' && (
        <h3 id={`${region.slug}-heading`} className={styles.heading}>
          {region.title}
        </h3>
      )}
      {region.description && <p className={styles.description}>{region.description}</p>}

      {region.races.length > 0 && (
        <div className={styles.group}>
          <GroupLabel as={groupTag}>{RACES_LABEL}</GroupLabel>
          {region.races.map((race) => (
            <RaceAccordion key={race._id} race={race} />
          ))}
        </div>
      )}

      {region.measures.length > 0 && (
        <div className={styles.group}>
          <GroupLabel as={groupTag}>{MEASURES_LABEL}</GroupLabel>
          {region.measures.map((measure) => (
            <MeasureAccordion key={measure._id} measure={measure} />
          ))}
        </div>
      )}

      {sections.map((section) => (
        <SectionGroup key={section._key} section={section} groupTag={groupTag} />
      ))}

      {!hasContent && !suppressEmpty && <p className={styles.empty}>{REGION_EMPTY}</p>}
    </section>
  )
}
