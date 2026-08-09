import {MeasureAccordion} from '@/components/MeasureAccordion'
import {RaceAccordion} from '@/components/RaceAccordion'
import {SectionGroup} from '@/components/SectionGroup'
import type {GuideRegion} from '@/lib/types'

import styles from './RegionSection.module.css'

interface RegionSectionProps {
  region: GuideRegion
}

export function RegionSection({region}: RegionSectionProps) {
  const sections = region.sections ?? []
  const hasContent = region.races.length > 0 || region.measures.length > 0 || sections.length > 0

  return (
    <section className={styles.section} id={region.slug ?? undefined} aria-labelledby={`${region.slug}-heading`}>
      <h3 id={`${region.slug}-heading`} className={styles.heading}>
        {region.title}
      </h3>
      {region.description && <p className={styles.description}>{region.description}</p>}

      {/* State/County: separate Race/Measure documents referencing this Region. */}
      {region.races.length > 0 && (
        <div className={styles.group}>
          {region.races.map((race) => (
            <RaceAccordion key={race._id} race={race} />
          ))}
        </div>
      )}

      {region.measures.length > 0 && (
        <div className={styles.group}>
          {region.measures.map((measure) => (
            <MeasureAccordion key={measure._id} measure={measure} />
          ))}
        </div>
      )}

      {/* City: this Region's own raceGroup/measureGroup blocks, merged with any
          specialDistrict that lists it — see docs/backend-strategy.md §11. */}
      {sections.map((section) => (
        <SectionGroup key={section._key} section={section} />
      ))}

      {!hasContent && <p className={styles.empty}>Nothing entered for this region yet.</p>}
    </section>
  )
}
