'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {AddressLookup, type AddressNotice} from '@/components/AddressLookup'
import {Cta} from '@/components/Cta'
import {useMatch} from '@/components/MatchProvider'
import {
  BALLOT_CHANGE_ERROR,
  BALLOT_LOOKUP_STATUS,
  CANCEL_CHANGE_ADDRESS_LABEL,
  CHANGE_ADDRESS_LABEL,
} from '@/lib/copy'

import styles from './ChangeAddress.module.css'

interface ChangeAddressProps {
  /** Gold button on the outside-coverage page. The ballot keeps the text link. */
  appearance?: 'link' | 'gold'
}

export function ChangeAddress({appearance = 'link'}: ChangeAddressProps) {
  const router = useRouter()
  const {lookupAddress, status} = useMatch()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)
  const [notice, setNotice] = useState<AddressNotice>(null)

  async function handleAddressSelected(address: string) {
    setError(false)
    setNotice(null)
    const destination = await lookupAddress(address)
    if (destination === 'outside') {
      setOpen(false)
      router.push('/outside')
    } else if (destination === 'ballot') {
      setOpen(false)
      router.push('/ballot')
    } else if (destination === 'incomplete' || destination === 'unmatched') {
      setNotice(destination)
    } else if (destination === 'error') {
      setError(true)
    }
  }

  function toggle() {
    setOpen((value) => !value)
    setError(false)
    setNotice(null)
  }

  const label = open ? CANCEL_CHANGE_ADDRESS_LABEL : CHANGE_ADDRESS_LABEL

  return (
    <>
      {appearance === 'gold' ? (
        <Cta ariaExpanded={open} onClick={toggle}>
          {label}
        </Cta>
      ) : (
        <button type="button" className={styles.changeAddress} aria-expanded={open} onClick={toggle}>
          {label}
        </button>
      )}
      {open && (
        <div className={styles.changePanel}>
          <AddressLookup
            invalid={error}
            notice={notice}
            onEdit={() => {
              setNotice(null)
              setError(false)
            }}
            onSelect={handleAddressSelected}
          />
          {status === 'loading' && <p className={styles.changeStatus}>{BALLOT_LOOKUP_STATUS}</p>}
          {error && (
            <p className={styles.changeError} role="alert">
              {BALLOT_CHANGE_ERROR}
            </p>
          )}
        </div>
      )}
    </>
  )
}
