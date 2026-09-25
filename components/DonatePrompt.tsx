'use client'

import {useEffect, useId, useState} from 'react'

import {Cta} from '@/components/Cta'
import {Modal} from '@/components/Modal'
import {
  DONATE_BUTTON_LABEL,
  DONATE_HREF,
  DONATE_POPUP_BODY,
  DONATE_POPUP_DISMISS,
  DONATE_POPUP_TITLE,
} from '@/lib/copy'
import {DONATE_PROMPT_DELAY_MS, hasSeenDonatePrompt, markDonatePromptSeen} from '@/lib/donatePrompt'

import styles from './DonatePrompt.module.css'

/**
 * First visit only, after 30 seconds. The flag is a single localStorage
 * bit — not the address, and not tied to the ballot match.
 */
export function DonatePrompt() {
  const titleId = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (hasSeenDonatePrompt()) return
    const timeoutId = window.setTimeout(() => setOpen(true), DONATE_PROMPT_DELAY_MS)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (open) markDonatePromptSeen()
  }, [open])

  function onClose() {
    markDonatePromptSeen()
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={onClose} titleId={titleId} className={styles.dialog}>
      <h2 id={titleId} className={styles.title}>
        {DONATE_POPUP_TITLE}
      </h2>
      <p className={styles.body}>{DONATE_POPUP_BODY}</p>
      <div className={styles.actions}>
        <Cta href={DONATE_HREF} external variant="donate" onClick={onClose}>
          {DONATE_BUTTON_LABEL}
        </Cta>
        <button type="button" className={styles.dismiss} onClick={onClose}>
          {DONATE_POPUP_DISMISS}
        </button>
      </div>
    </Modal>
  )
}
