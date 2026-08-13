'use client'

import '@geoapify/geocoder-autocomplete/styles/minimal.css'

import {GeocoderAutocomplete} from '@geoapify/geocoder-autocomplete'
import {useEffect, useRef} from 'react'

import styles from './AddressLookup.module.css'

interface AddressLookupProps {
  onSelect: (address: string) => void
}

/**
 * Address autocomplete input. Wraps Geoapify's vanilla-JS widget (there's
 * no official React component) in a plain container div, since it manages
 * its own DOM. The browser talks to Geoapify directly with a publishable,
 * referrer-restricted key — this component never sends the address to our
 * own server; that only happens after the user picks a suggestion (see
 * GuideBody, which POSTs to /api/match-ballot). See
 * docs/address-matching-strategy.md.
 */
export function AddressLookup({onSelect}: AddressLookupProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

  useEffect(() => {
    if (!containerRef.current || !apiKey) return

    const autocomplete = new GeocoderAutocomplete(containerRef.current, apiKey, {
      placeholder: 'Enter your home address',
      countryCodes: ['us'],
      type: 'street',
      skipIcons: true,
    })

    autocomplete.on('select', (feature) => {
      const formatted = feature?.properties?.formatted
      if (typeof formatted === 'string' && formatted.length > 0) onSelectRef.current(formatted)
    })

    return () => autocomplete.destroy()
  }, [apiKey])

  if (!apiKey) {
    return (
      <p className={styles.missingKey}>
        Address lookup isn&apos;t configured yet (missing <code>NEXT_PUBLIC_GEOAPIFY_API_KEY</code>). You
        can still browse the full guide below.
      </p>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.autocomplete} />
      <p className={styles.privacyNote}>
        Your address is used only to find your ballot — it isn&apos;t saved, logged, or shared.
      </p>
    </div>
  )
}
