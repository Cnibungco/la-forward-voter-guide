import {MeasureAccordion} from '@/components/MeasureAccordion'
import {RaceAccordion} from '@/components/RaceAccordion'
import type {GuideSection} from '@/lib/types'

import styles from './RegionSection.module.css'

export function GroupLabel({as: Tag, children}: {as: 'h2' | 'h3' | 'h4'; children: string}) {
  return <Tag className={styles.groupLabel}>{children}</Tag>
}

interface SectionGroupProps {
  section: GuideSection
  groupTag: 'h2' | 'h3' | 'h4'
}

/**
 * One labeled block from a city Region's (or specialDistrict's)
 * `sections` array — a `raceGroup` or `measureGroup`. See
 * docs/backend-strategy.md §11.
 */
export function SectionGroup({section, groupTag}: SectionGroupProps) {
  if (section._type === 'raceGroup') {
    const races = section.races ?? []
    if (races.length === 0) return null

    return (
      <div className={styles.group}>
        <GroupLabel as={groupTag}>{section.label}</GroupLabel>
        {races.map((race, index) => (
          <RaceAccordion key={race._key ?? index} race={race} groupLabel={section.label} />
        ))}
      </div>
    )
  }

  const measures = section.measures ?? []
  if (measures.length === 0) return null

  return (
    <div className={styles.group}>
      <GroupLabel as={groupTag}>{section.label}</GroupLabel>
      {measures.map((measure, index) => (
        <MeasureAccordion key={measure._key ?? index} measure={measure} />
      ))}
    </div>
  )
}
