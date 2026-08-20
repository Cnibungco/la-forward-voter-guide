'use client'

import {useState, type ReactNode} from 'react'

import {BackToTop, GUIDE_TOP_ID} from '@/components/BackToTop'
import {GuideNav} from '@/components/GuideNav'
import {PageNav} from '@/components/PageNav'
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
}

export function GuideShell({
  regions,
  title,
  crumb,
  activeSlug,
  heading,
  children,
  showPageNav = false,
}: GuideShellProps) {
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {prev, next} = adjacentRegions(regions, showPageNav ? activeSlug : null)

  function closeDrawer() {
    setDrawerOpen(false)
  }

  return (
    <div className={styles.shell} id={GUIDE_TOP_ID}>
      <div className={styles.triggerBar}>
        <button
          type="button"
          className={styles.burger}
          aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
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
            <nav className={styles.drawer} aria-label="Jurisdictions">
              <div className={styles.drawerHead}>
                <span className={styles.drawerTitle}>Jump to</span>
                <button type="button" className={styles.drawerClose} onClick={closeDrawer} aria-label="Close navigation">
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

        <main className={styles.main}>
          {crumb && <p className={styles.crumb}>{crumb}</p>}
          <div className={styles.titleRow}>
            {heading ?? <h1 className={styles.title}>{title}</h1>}
          </div>
          {children}
          {showPageNav && (
            <>
              <PageNav prev={prev} next={next} />
              <BackToTop />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
