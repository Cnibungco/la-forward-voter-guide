'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState} from 'react'

import {GoogleTranslate} from '@/components/GoogleTranslate'
import {ORG_HREF} from '@/lib/copy'

import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={`${styles.brand} notranslate`} translate="no">
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
        <GoogleTranslate />
        <a href={ORG_HREF} target="_blank" rel="noopener noreferrer" className={styles.orgLink}>
          laforward.org ↗
        </a>
        <Link href="/#donate" className={styles.donate}>
          Donate
        </Link>
      </div>
    </header>
  )
}
