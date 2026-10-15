'use client'

import Link from 'next/link'
import {useState} from 'react'

import {SearchIcon} from '@/components/SearchIcon'
import {CITIES_BODY, CITIES_EMPTY, CITIES_NONE, FIND_YOUR_CITY_LABEL} from '@/lib/copy'
import type {ShellPlace} from '@/lib/shellPayload'

import styles from './CityPicker.module.css'

export function CityPicker({cities: allCities}: {cities: ShellPlace[]}) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const cities = allCities.filter((city) => !query || city.title.toLowerCase().includes(query))

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
            <li key={city.id}>
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
