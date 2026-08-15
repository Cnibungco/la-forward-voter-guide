'use client'

import '@geoapify/geocoder-autocomplete/styles/minimal.css'

import {GeocoderAutocomplete} from '@geoapify/geocoder-autocomplete'
import {useEffect, useRef} from 'react'

import {PRIVACY_NOTE} from '@/lib/copy'
import {censusAddressFromFeature} from '@/lib/geoapifyAddress'

import styles from './AddressLookup.module.css'

/** Downtown LA — ranks city addresses above the rest of the county. */
const LA_PROXIMITY = {lon: -118.2437, lat: 34.0522}

/**
 * LA County extent (OSM relation 396479), padded slightly so Malibu /
 * Lancaster / Claremont / San Clemente Island aren't clipped. A rectangle
 * can't exclude Orange County's La Habra pocket; Census still rejects
 * those after select.
 */
const LA_COUNTY_RECT = {lon1: -118.96, lat1: 32.74, lon2: -117.64, lat2: 34.83}

interface AddressLookupProps {
  onSelect: (address: string) => void
}

/**
 * Address autocomplete input. Wraps Geoapify's vanilla-JS widget (there's
 * no official React component) in a plain container div, since it manages
 * its own DOM. The browser talks to Geoapify directly with a publishable,
 * referrer-restricted key — this component never sends the address to our
 * own server; that only happens after the user picks a suggestion (see
 * MatchProvider, which POSTs to /api/match-ballot). See
 * docs/address-matching-strategy.md.
 */
export function AddressLookup({onSelect}: AddressLookupProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

  useEffect(() => {
    if (!containerRef.current || !apiKey) return

    // Don't set `type: 'street'` — that returns street names only, so house
    // numbers never appear, and a street named "East Dore Street" in
    // Louisiana outranks "Dore Street" in West Covina. Unset type so
    // buildings come back; the county rect keeps results in LA County.
    const autocomplete = new GeocoderAutocomplete(containerRef.current, apiKey, {
      placeholder: 'Enter your home address',
      skipIcons: true,
      allowNonVerifiedHouseNumber: true,
      filter: {countrycode: ['us'], rect: LA_COUNTY_RECT},
      bias: {proximity: LA_PROXIMITY},
    })

    autocomplete.on('select', (feature) => {
      const address = censusAddressFromFeature(feature?.properties)
      if (address) onSelectRef.current(address)
    })

    return () => autocomplete.destroy()
  }, [apiKey])

  if (!apiKey) {
    return (
      <p className={styles.missingKey}>
        Address lookup isn&apos;t configured yet (missing <code>NEXT_PUBLIC_GEOAPIFY_API_KEY</code>). You
        can still browse the guide by jurisdiction.
      </p>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.autocomplete} />
      <p className={styles.privacyNote}>{PRIVACY_NOTE}</p>
    </div>
  )
}
