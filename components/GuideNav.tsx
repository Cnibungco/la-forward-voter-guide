'use client'

import Link from 'next/link'

import {SearchIcon} from '@/components/SearchIcon'
import {CITIES_EMPTY, FIND_YOUR_CITY_LABEL, NAV_STATE_COUNTY, NAV_STATE_EMPTY} from '@/lib/copy'
import {TIER_LABELS} from '@/lib/labels'
import {navCities, navStateCounty} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

import styles from './GuideNav.module.css'

interface GuideNavProps {
  regions: GuideRegion[]
  activeSlug?: string | null
  search: string
  onSearch: (value: string) => void
  onNavigate?: () => void
}

export function GuideNav({regions, activeSlug, search, onSearch, onNavigate}: GuideNavProps) {
  const query = search.trim().toLowerCase()
  const stateCounty = navStateCounty(regions).filter(
    (region) => !query || region.title.toLowerCase().includes(query),
  )
  const cities = navCities(regions).filter(
    (region) => !query || region.title.toLowerCase().includes(query),
  )

  return (
    <>
      <label className={styles.searchLabel}>
        <span className={styles.visuallyHidden}>{FIND_YOUR_CITY_LABEL}</span>
        <span className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="search"
            className={styles.search}
            placeholder={FIND_YOUR_CITY_LABEL}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </span>
      </label>

      <p className={styles.tier}>{NAV_STATE_COUNTY}</p>
      {stateCounty.length === 0 ? (
        query ? <p className={styles.empty}>{NAV_STATE_EMPTY}</p> : null
      ) : (
        stateCounty.map((region) => (
          <NavItem
            key={region._id}
            href={`/guide/${region.slug}`}
            label={region.title}
            active={activeSlug === region.slug}
            onNavigate={onNavigate}
          />
        ))
      )}

      <p className={styles.tier}>{TIER_LABELS.city}</p>
      {cities.length === 0 ? (
        <p className={styles.empty}>{CITIES_EMPTY}</p>
      ) : (
        cities.map((region) => (
          <NavItem
            key={region._id}
            href={`/guide/${region.slug}`}
            label={region.title}
            active={activeSlug === region.slug}
            onNavigate={onNavigate}
          />
        ))
      )}
    </>
  )
}

function NavItem({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string
  label: string
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      className={active ? `${styles.item} ${styles.itemActive}` : styles.item}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}
