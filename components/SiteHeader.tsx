'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState} from 'react'

import {DONATE_HREF, ORG_HREF} from '@/lib/copy'

import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          {logoFailed ? (
            <span className={styles.logoFallback}>LA FORWARD</span>
          ) : (
            <Image
              src="/la-forward-logo.webp"
              alt="LA Forward"
              width={363}
              height={84}
              className={styles.logo}
              onError={() => setLogoFailed(true)}
              priority
            />
          )}
        </Link>
        <span className={styles.tagline}>Voter Guide</span>
      </div>
      <div className={styles.right}>
        <a href={ORG_HREF} target="_blank" rel="noopener noreferrer" className={styles.orgLink}>
          laforward.org ↗
        </a>
        <a href={DONATE_HREF} target="_blank" rel="noopener noreferrer" className={styles.donate}>
          Donate
        </a>
      </div>
    </header>
  )
}
