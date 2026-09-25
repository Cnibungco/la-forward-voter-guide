'use client'

import Link from 'next/link'
import {useState} from 'react'

import {SearchIcon} from '@/components/SearchIcon'
import {CITIES_BODY, CITIES_EMPTY, CITIES_NONE, FIND_YOUR_CITY_LABEL} from '@/lib/copy'
import {navCities} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

import styles from './CityPicker.module.css'

export function CityPicker({regions}: {regions: GuideRegion[]}) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const allCities = navCities(regions)
  const cities = allCities.filter((region) => !query || region.title.toLowerCase().includes(query))

  if (allCities.length === 0) {
    return <p className={styles.empty}>{CITIES_NONE}</p>
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.body}>{CITIES_BODY}</p>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{FIND_YOUR_CITY_LABEL}</span>
        <span className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="search"
            className={styles.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
          />
        </span>
      </label>
      {cities.length === 0 ? (
        <p className={styles.empty}>{CITIES_EMPTY}</p>
      ) : (
        <ul className={styles.list}>
          {cities.map((city) => (
            <li key={city._id}>
              <Link href={`/guide/${city.slug}`} className={styles.item}>
                {city.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
