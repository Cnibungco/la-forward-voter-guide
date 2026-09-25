'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState} from 'react'

import {Cta} from '@/components/Cta'
import {GoogleTranslate} from '@/components/GoogleTranslate'
import {ShareGuide} from '@/components/ShareGuide'
import {DONATE_BUTTON_LABEL, DONATE_HREF, ORG_HREF} from '@/lib/copy'

import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={`${styles.brand} notranslate`}
        translate="no"
        aria-label="LA Forward Voter Guide home"
      >
        {logoFailed ? (
          <span className={styles.logoFallback} aria-hidden="true">
            LA FORWARD
          </span>
        ) : (
          <Image
            src="/la-forward-logo.webp"
            alt=""
            width={363}
            height={84}
            className={styles.logo}
            onError={() => setLogoFailed(true)}
            priority
          />
        )}
        <span className={styles.tagline}>Voter Guide</span>
      </Link>
      <div className={styles.right}>
        <GoogleTranslate />
        <a href={ORG_HREF} target="_blank" rel="noopener noreferrer" className={styles.orgLink}>
          laforward.org ↗
        </a>
        <ShareGuide />
        <Cta href={DONATE_HREF} external variant="donate" size="compact">
          {DONATE_BUTTON_LABEL}
        </Cta>
      </div>
    </header>
  )
}
