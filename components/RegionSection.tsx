import {MeasureAccordion} from '@/components/MeasureAccordion'
import {RaceAccordion} from '@/components/RaceAccordion'
import {SectionGroup} from '@/components/SectionGroup'
import type {GuideRegion} from '@/lib/types'

import styles from './RegionSection.module.css'

interface RegionSectionProps {
  region: GuideRegion
  headingLevel?: 'h3' | 'none'
}

export function RegionSection({region, headingLevel = 'none'}: RegionSectionProps) {
  const sections = region.sections ?? []
  const hasContent = region.races.length > 0 || region.measures.length > 0 || sections.length > 0

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
          <p className={styles.groupLabel}>Races</p>
          {region.races.map((race) => (
            <RaceAccordion key={race._id} race={race} />
          ))}
        </div>
      )}

      {region.measures.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>Ballot measures</p>
          {region.measures.map((measure) => (
            <MeasureAccordion key={measure._id} measure={measure} />
          ))}
        </div>
      )}

      {sections.map((section) => (
        <SectionGroup key={section._key} section={section} />
      ))}

      {!hasContent && <p className={styles.empty}>Nothing entered for this region yet.</p>}
    </section>
  )
}
