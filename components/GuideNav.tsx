'use client'

import Link from 'next/link'

import {SearchIcon} from '@/components/SearchIcon'
import {CITIES_EMPTY, GUIDE_SEARCH_EMPTY, GUIDE_SEARCH_LABEL, NAV_STATE_COUNTY} from '@/lib/copy'
import {navDistricts} from '@/lib/districts'
import {revealGuideAnchor, searchGuide} from '@/lib/guideSearch'
import {SCHOOL_DISTRICTS_LABEL, TIER_LABELS} from '@/lib/labels'
import {navCities, navStateCounty} from '@/lib/regions'
import type {GuideDistrict, GuideRegion} from '@/lib/types'

import styles from './GuideNav.module.css'

interface GuideNavProps {
  regions: GuideRegion[]
  districts?: GuideDistrict[]
  /** Path of the row to highlight, such as `/guide/burbank` or `/districts/lausd`. */
  activeHref?: string | null
  search: string
  onSearch: (value: string) => void
  onNavigate?: () => void
}

export function GuideNav({regions, districts = [], activeHref, search, onSearch, onNavigate}: GuideNavProps) {
  const query = search.trim().toLowerCase()
  const hits = query ? searchGuide(regions, query, districts) : []
  const stateCounty = navStateCounty(regions)
  const cities = navCities(regions)
  const schoolDistricts = navDistricts(districts)

  return (
    <>
      <label className={styles.searchLabel}>
        <span className={styles.visuallyHidden}>{GUIDE_SEARCH_LABEL}</span>
        <span className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="search"
            className={styles.search}
            placeholder={GUIDE_SEARCH_LABEL}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </span>
      </label>

      {query ? (
        hits.length === 0 ? (
          <p className={styles.empty}>{GUIDE_SEARCH_EMPTY}</p>
        ) : (
          hits.map((hit) => (
            <NavItem
              key={hit.key}
              href={hit.href}
              label={hit.label}
              context={hit.context}
              active={false}
              onNavigate={onNavigate}
            />
          ))
        )
      ) : (
        <JurisdictionList
          stateCounty={stateCounty}
          cities={cities}
          districts={schoolDistricts}
          activeHref={activeHref}
          onNavigate={onNavigate}
        />
      )}
    </>
  )
}

function isCurrent(href: string, activeHref?: string | null): boolean {
  if (!activeHref) return false
  return href.split('#')[0] === activeHref
}

function JurisdictionList({
  stateCounty,
  cities,
  districts,
  activeHref,
  onNavigate,
}: {
  stateCounty: ReturnType<typeof navStateCounty>
  cities: ReturnType<typeof navCities>
  districts: ReturnType<typeof navDistricts>
  activeHref?: string | null
  onNavigate?: () => void
}) {
  return (
    <>
      <p className={styles.tier}>{NAV_STATE_COUNTY}</p>
      {stateCounty.length > 0 && (
        stateCounty.map((region) => (
          <NavItem
            key={region._id}
            href={`/guide/${region.slug}`}
            label={region.title}
            active={isCurrent(`/guide/${region.slug}`, activeHref)}
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
            active={isCurrent(`/guide/${region.slug}`, activeHref)}
            onNavigate={onNavigate}
          />
        ))
      )}

      {districts.length > 0 && (
        <>
          <p className={styles.tier}>{SCHOOL_DISTRICTS_LABEL}</p>
          {districts.map((district) => (
            <NavItem
              key={district._id}
              href={`/districts/${district.slug}`}
              label={district.title}
              active={isCurrent(`/districts/${district.slug}`, activeHref)}
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}
    </>
  )
}

function NavItem({
  href,
  label,
  context,
  active,
  onNavigate,
}: {
  href: string
  label: string
  context?: string
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      className={active ? `${styles.item} ${styles.itemActive}` : styles.item}
      onClick={(event) => {
        const url = new URL(href, window.location.href)
        const id = decodeURIComponent(url.hash.replace(/^#/, ''))
        if (url.pathname === window.location.pathname && id && revealGuideAnchor(id)) {
          event.preventDefault()
          window.history.pushState(null, '', `${url.pathname}${url.hash}`)
        }
        onNavigate?.()
      }}
      aria-current={active ? 'page' : undefined}
    >
      {context ? (
        <>
          <span className={styles.hitLabel}>{label}</span>
          <span className={styles.hitContext}>{context}</span>
        </>
      ) : (
        label
      )}
    </Link>
  )
}
