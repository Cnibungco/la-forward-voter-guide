import {TIER_LABELS} from '@/lib/labels'
import type {GuideRegion, RegionTier} from '@/lib/types'

import styles from './GuideNav.module.css'

interface GuideNavProps {
  regions: GuideRegion[]
}

// Tiers are hardcoded nav sections, not CMS content — see
// schemaTypes/region.ts. Fixed display order regardless of what exists
// in the dataset.
const TIER_ORDER: RegionTier[] = ['state', 'county', 'city']

export function GuideNav({regions}: GuideNavProps) {
  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    regions: regions.filter((region) => region.tier === tier),
  })).filter(({regions}) => regions.length > 0)

  if (tiers.length === 0) return null

  return (
    <nav className={styles.nav} aria-label="Jump to a section of the guide">
      {tiers.map(({tier, regions}) => (
        <div key={tier} className={styles.tierGroup}>
          <span className={styles.tierLabel}>{TIER_LABELS[tier]}</span>
          <ul className={styles.regionList}>
            {regions.map((region) => (
              <li key={region._id}>
                <a href={`#${region.slug}`}>{region.title}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
