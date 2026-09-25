'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'

import {BackToTop, GUIDE_TOP_ID} from '@/components/BackToTop'
import {GuideNav} from '@/components/GuideNav'
import {PageNav} from '@/components/PageNav'
import {CLOSE_CITY_LIST_LABEL, JUMP_TO_LABEL, OPEN_CITY_LIST_LABEL} from '@/lib/copy'
import {adjacentRegions} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

import styles from './GuideShell.module.css'

interface GuideShellProps {
  regions: GuideRegion[]
  title: string
  crumb?: string
  activeSlug?: string | null
  heading?: ReactNode
  children: ReactNode
  /** Previous/next jurisdiction bar. Off on ballot and outside coverage. */
  showPageNav?: boolean
  /** Jump-to-top on long pages. On with page nav; also on the ballot. */
  showBackToTop?: boolean
}

export function GuideShell({
  regions,
  title,
  crumb,
  activeSlug,
  heading,
  children,
  showPageNav = false,
  showBackToTop = false,
}: GuideShellProps) {
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const drawerWasOpen = useRef(false)
  const {prev, next} = adjacentRegions(regions, showPageNav ? activeSlug : null)

  function closeDrawer() {
    setDrawerOpen(false)
  }

  useEffect(() => {
    const header = document.querySelector('header')
    if (!drawerOpen) {
      if (drawerWasOpen.current) {
        drawerWasOpen.current = false
        burgerRef.current?.focus()
      }
      return
    }

    drawerWasOpen.current = true
    header?.setAttribute('inert', '')
    drawerRef.current?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      header?.removeAttribute('inert')
    }
  }, [drawerOpen])

  return (
    <div className={styles.shell} id={GUIDE_TOP_ID}>
      <div className={styles.triggerBar} role="region" aria-label={title} inert={drawerOpen}>
        <button
          ref={burgerRef}
          type="button"
          className={styles.burger}
          aria-label={drawerOpen ? CLOSE_CITY_LIST_LABEL : OPEN_CITY_LIST_LABEL}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <span className={styles.triggerTitle}>{title}</span>
      </div>

      <div className={styles.body}>
        <nav className={styles.rail} aria-label="Jurisdictions">
          <GuideNav
            regions={regions}
            activeSlug={activeSlug}
            search={search}
            onSearch={setSearch}
          />
        </nav>

        {drawerOpen && (
          <>
            <div className={styles.scrim} onClick={closeDrawer} />
            <nav ref={drawerRef} className={styles.drawer} aria-label="Jurisdictions" tabIndex={-1}>
              <div className={styles.drawerHead}>
                <span className={styles.drawerTitle}>{JUMP_TO_LABEL}</span>
                <button
                  type="button"
                  className={styles.drawerClose}
                  onClick={closeDrawer}
                  aria-label={CLOSE_CITY_LIST_LABEL}
                >
                  ✕
                </button>
              </div>
              <div className={styles.drawerNav}>
                <GuideNav
                  regions={regions}
                  activeSlug={activeSlug}
                  search={search}
                  onSearch={setSearch}
                  onNavigate={closeDrawer}
                />
              </div>
            </nav>
          </>
        )}

        <main className={styles.main} inert={drawerOpen}>
          {crumb && <p className={styles.crumb}>{crumb}</p>}
          <div className={styles.titleRow}>
            {heading ?? <h1 className={styles.title}>{title}</h1>}
          </div>
          {children}
          {showPageNav && <PageNav prev={prev} next={next} />}
          {(showPageNav || showBackToTop) && <BackToTop />}
        </main>
      </div>
    </div>
  )
}
