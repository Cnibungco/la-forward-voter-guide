import {MeasureAccordion} from '@/components/MeasureAccordion'
import {RaceAccordion} from '@/components/RaceAccordion'
import type {GuideSection} from '@/lib/types'

import styles from './RegionSection.module.css'

interface SectionGroupProps {
  section: GuideSection
}

/**
 * One labeled block from a city Region's (or specialDistrict's)
 * `sections` array — a `raceGroup` or `measureGroup`. See
 * docs/backend-strategy.md §11.
 */
export function SectionGroup({section}: SectionGroupProps) {
  if (section._type === 'raceGroup') {
    const races = section.races ?? []
    if (races.length === 0) return null

    return (
      <div className={styles.group}>
        <h4 className={styles.groupLabel}>{section.label}</h4>
        {races.map((race, index) => (
          <RaceAccordion key={race._key ?? index} race={race} />
        ))}
      </div>
    )
  }

  const measures = section.measures ?? []
  if (measures.length === 0) return null

  return (
    <div className={styles.group}>
      <h4 className={styles.groupLabel}>{section.label}</h4>
      {measures.map((measure, index) => (
        <MeasureAccordion key={measure._key ?? index} measure={measure} />
      ))}
    </div>
  )
}
