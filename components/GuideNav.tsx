'use client'

import Link from 'next/link'

import {SearchIcon} from '@/components/SearchIcon'
import {CITIES_EMPTY, GUIDE_SEARCH_EMPTY, GUIDE_SEARCH_LABEL, NAV_STATE_COUNTY} from '@/lib/copy'
import {revealGuideAnchor, searchGuide} from '@/lib/guideSearch'
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
  const hits = query ? searchGuide(regions, query) : []
  const stateCounty = navStateCounty(regions)
  const cities = navCities(regions)

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
          activeSlug={activeSlug}
          onNavigate={onNavigate}
        />
      )}
    </>
  )
}

function JurisdictionList({
  stateCounty,
  cities,
  activeSlug,
  onNavigate,
}: {
  stateCounty: ReturnType<typeof navStateCounty>
  cities: ReturnType<typeof navCities>
  activeSlug?: string | null
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
