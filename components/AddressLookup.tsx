'use client'

import '@geoapify/geocoder-autocomplete/styles/minimal.css'

import {GeocoderAutocomplete} from '@geoapify/geocoder-autocomplete'
import {useEffect, useId, useRef, useState} from 'react'

import {SearchIcon} from '@/components/SearchIcon'
import {
  ADDRESS_LOOKUP_UNAVAILABLE,
  ADDRESS_NEED_STREET,
  ADDRESS_NOT_FOUND,
  ADDRESS_PICK_HINT,
  ADDRESS_PLACEHOLDER,
  HOME_ADDRESS_LABEL,
  PRIVACY_NOTE,
} from '@/lib/copy'
import {addressPickFromFeature, hasHouseNumber} from '@/lib/geoapifyAddress'

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

export type AddressNotice = 'incomplete' | 'unmatched' | null

interface AddressLookupProps {
  onSelect: (address: string) => void
  /** Set when a lookup comes back incomplete or unmatched. Cleared on edit. */
  notice?: AddressNotice
  /** Lookup failed (network or Census). The message is rendered by the parent. */
  invalid?: boolean
  onEdit?: () => void
}

type Hint = 'default' | 'pick' | 'incomplete'

function hintClassName(alert: boolean, hint: Hint): string {
  if (alert) return `${styles.hint} ${styles.hintZip}`
  if (hint === 'pick') return `${styles.hint} ${styles.hintEmphasized}`
  return styles.hint
}

/**
 * Address autocomplete input. Wraps Geoapify's vanilla-JS widget (there's
 * no official React component) in a plain container div, since it manages
 * its own DOM. The browser talks to Geoapify directly with a publishable,
 * referrer-restricted key — this component never sends the address to our
 * own server. A pick with a house number and street is POSTed to
 * /api/match-ballot (see MatchProvider). A zip, neighborhood, landmark,
 * PO Box, or street with no house number stays on this form. See
 * docs/address-matching-strategy.md.
 */
export function AddressLookup({onSelect, notice = null, invalid = false, onEdit}: AddressLookupProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit
  const inputId = useId()
  const hintId = useId()
  const privacyId = useId()
  const [hint, setHint] = useState<Hint>('default')
  const heldValueRef = useRef<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

  useEffect(() => {
    if (!containerRef.current || !apiKey) return

    // Don't set `type: 'street'` — that returns street names only, so house
    // numbers never appear, and a street named "East Dore Street" in
    // Louisiana outranks "Dore Street" in West Covina. Unset type so
    // buildings come back; the county rect keeps results in LA County.
    const autocomplete = new GeocoderAutocomplete(containerRef.current, apiKey, {
      placeholder: ADDRESS_PLACEHOLDER,
      skipIcons: true,
      allowNonVerifiedHouseNumber: true,
      filter: {countrycode: ['us'], rect: LA_COUNTY_RECT},
      bias: {proximity: LA_PROXIMITY},
    })

    const input = containerRef.current.querySelector<HTMLInputElement>('input')
    if (input) {
      input.id = inputId
      input.setAttribute('aria-describedby', `${hintId} ${privacyId}`)
      input.setAttribute('autocomplete', 'off')
    }

    function onEnter(event: KeyboardEvent) {
      if (event.key !== 'Enter') return
      const value = input?.value ?? ''
      if (value.trim() && !hasHouseNumber(value)) {
        heldValueRef.current = value
        setHint('incomplete')
        onEditRef.current?.()
      } else {
        heldValueRef.current = null
        setHint('pick')
      }
    }
    function onInput() {
      // Keep the correction up while the field still holds the place the
      // visitor just picked. The next edit clears it.
      if (input && heldValueRef.current !== null && input.value === heldValueRef.current) return
      heldValueRef.current = null
      setHint('default')
      onEditRef.current?.()
    }
    input?.addEventListener('keydown', onEnter)
    input?.addEventListener('input', onInput)

    autocomplete.on('clear', () => {
      heldValueRef.current = null
      setHint('default')
      onEditRef.current?.()
    })

    autocomplete.on('select', (feature) => {
      const pick = addressPickFromFeature(feature?.properties)
      if (pick.kind === 'address') {
        heldValueRef.current = null
        setHint('default')
        onSelectRef.current(pick.address)
      } else if (pick.kind === 'incomplete') {
        heldValueRef.current = input?.value ?? ''
        setHint('incomplete')
        onEditRef.current?.()
      } else {
        heldValueRef.current = null
        setHint('pick')
      }
    })

    return () => {
      input?.removeEventListener('keydown', onEnter)
      input?.removeEventListener('input', onInput)
      autocomplete.destroy()
    }
  }, [apiKey, hintId, inputId, privacyId])

  const messageAlert = hint === 'incomplete' || notice === 'incomplete' || notice === 'unmatched'
  const fieldInvalid = messageAlert || invalid

  useEffect(() => {
    const input = containerRef.current?.querySelector('input')
    if (!input) return
    if (fieldInvalid) input.setAttribute('aria-invalid', 'true')
    else input.removeAttribute('aria-invalid')
  }, [fieldInvalid])

  if (!apiKey) {
    return <p className={styles.missingKey}>{ADDRESS_LOOKUP_UNAVAILABLE}</p>
  }

  const message =
    hint === 'incomplete' || notice === 'incomplete'
      ? ADDRESS_NEED_STREET
      : notice === 'unmatched'
        ? ADDRESS_NOT_FOUND
        : ADDRESS_PICK_HINT

  return (
    <div className={`${styles.wrapper} notranslate`} translate="no">
      <label className={styles.fieldLabel} htmlFor={inputId}>
        {HOME_ADDRESS_LABEL}
      </label>
      <div className={styles.inputWrap}>
        <SearchIcon className={fieldInvalid ? `${styles.searchIcon} ${styles.searchIconError}` : styles.searchIcon} />
        <div
          ref={containerRef}
          className={fieldInvalid ? `${styles.autocomplete} ${styles.invalid}` : styles.autocomplete}
        />
      </div>
      <p id={hintId} className={hintClassName(messageAlert, hint)} role={messageAlert ? 'alert' : undefined}>
        {message}
      </p>
      <p id={privacyId} className={styles.privacyNote}>
        {PRIVACY_NOTE}
      </p>
    </div>
  )
}
