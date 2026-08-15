'use client'

import Link from 'next/link'

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
        <span className={styles.visuallyHidden}>Find your city</span>
        <input
          type="search"
          className={styles.search}
          placeholder="Find your city"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>

      <p className={styles.tier}>State &amp; county</p>
      {stateCounty.map((region) => (
        <NavItem
          key={region._id}
          href={`/guide/${region.slug}`}
          label={region.title}
          active={activeSlug === region.slug}
          onNavigate={onNavigate}
        />
      ))}

      <p className={styles.tier}>Local cities</p>
      {cities.length === 0 ? (
        <p className={styles.empty}>No cities match that search.</p>
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
