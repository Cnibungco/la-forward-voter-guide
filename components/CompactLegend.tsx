'use client'

import {useEffect, useId, useRef, useState} from 'react'

import {RatingLegend} from '@/components/RatingLegend'
import {LEGEND_TRIGGER} from '@/lib/copy'

import styles from './CompactLegend.module.css'

export function CompactLegend() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function onPointer(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      className={styles.wrap}
      ref={wrapRef}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) setOpen(false)
      }}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.info} aria-hidden="true">
          i
        </span>
        <span>{LEGEND_TRIGGER}</span>
        <span className={open ? `${styles.chev} ${styles.chevOpen}` : styles.chev} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.pop} id={panelId}>
          <RatingLegend />
        </div>
      )}
    </div>
  )
}
