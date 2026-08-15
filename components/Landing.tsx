'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {AddressLookup} from '@/components/AddressLookup'
import {RatingBadge} from '@/components/RatingBadge'
import {useMatch} from '@/components/MatchProvider'
import {
  ADDRESS_LABEL,
  COURAGE_CA_HREF,
  DONATE_ASK,
  DONATE_HREF,
  ELECTION_KICKER,
  HERO_IMAGE_ALT,
  HERO_SUB,
  HERO_TITLE,
  LANDING_ABOUT_BODY,
  LANDING_ABOUT_SUMMARY,
  LAVOTE_HREF,
  LEGEND_HEAD,
  LEGEND_SUB,
  SAMPLE_BALLOT_LABEL,
} from '@/lib/copy'
import {CANDIDATE_LEGEND, MEASURE_LEGEND} from '@/lib/labels'
import {firstOtherCity, isLosAngelesCity, regionByTier} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

import styles from './Landing.module.css'

interface LandingProps {
  regions: GuideRegion[]
  sampleBallotUrl: string | null
  disclaimer: string
}

export function Landing({regions, sampleBallotUrl, disclaimer}: LandingProps) {
  const router = useRouter()
  const {lookupAddress, status} = useMatch()
  const [heroFailed, setHeroFailed] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const stateRegion = regionByTier(regions, 'state')
  const countyRegion = regionByTier(regions, 'county')
  const laCity = regions.find(isLosAngelesCity)
  const otherCity = firstOtherCity(regions)

  async function handleAddressSelected(address: string) {
    const destination = await lookupAddress(address)
    if (destination === 'ballot') router.push('/ballot')
    else if (destination === 'outside') router.push('/outside')
  }

  return (
    <main className={styles.wrap}>
      <section className={styles.hero} aria-label="Voter guide">
        {!heroFailed && (
          <Image
            src="/hero.webp"
            alt={HERO_IMAGE_ALT}
            fill
            priority
            className={styles.heroImage}
            sizes="(max-width: 720px) 100vw, 720px"
            onError={() => setHeroFailed(true)}
            unoptimized
          />
        )}
        <div className={styles.heroPlate}>
          <p className={styles.kicker}>{ELECTION_KICKER}</p>
          <h1 className={styles.heroTitle}>{HERO_TITLE}</h1>
          <p className={styles.heroSub}>{HERO_SUB}</p>
        </div>
      </section>

      <p className={styles.lavote}>
        Need a vote center or drop box first? Visit{' '}
        <a href={LAVOTE_HREF} target="_blank" rel="noopener noreferrer">
          lavote.gov
        </a>
        .
      </p>

      <div className={styles.noteCard}>
        <button
          type="button"
          className={styles.noteToggle}
          aria-expanded={aboutOpen}
          onClick={() => setAboutOpen((open) => !open)}
        >
          <span>{LANDING_ABOUT_SUMMARY}</span>
          <span className={aboutOpen ? `${styles.noteChev} ${styles.noteChevOpen}` : styles.noteChev} aria-hidden="true" />
        </button>
        {aboutOpen && (
          <div className={styles.noteBody}>
            <p>{disclaimer}</p>
            {LANDING_ABOUT_BODY.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            {sampleBallotUrl && (
              <p>
                <a href={sampleBallotUrl} target="_blank" rel="noopener noreferrer">
                  {SAMPLE_BALLOT_LABEL} ↗
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.addressCard}>
        <p className={styles.addressLabel}>{ADDRESS_LABEL}</p>
        <AddressLookup onSelect={handleAddressSelected} />
        {status === 'loading' && <p className={styles.status}>Looking up your ballot…</p>}
        {status === 'error' && (
          <p className={styles.statusError}>
            Something went wrong looking up that address. Browse a jurisdiction below. Nothing about
            it was stored.
            {sampleBallotUrl && (
              <>
                {' '}
                You can also check the{' '}
                <a href={sampleBallotUrl} target="_blank" rel="noopener noreferrer">
                  {SAMPLE_BALLOT_LABEL}
                </a>
                .
              </>
            )}
          </p>
        )}
      </div>

      <div className={styles.orRow}>
        <span className={styles.orLine} />
        <span className={styles.orText}>or browse manually</span>
        <span className={styles.orLine} />
      </div>

      <div className={styles.cards}>
        {stateRegion?.slug && (
          <Link href={`/guide/${stateRegion.slug}`} className={styles.card}>
            <span className={styles.cardEyebrow}>Statewide</span>
            {stateRegion.title}
          </Link>
        )}
        {countyRegion?.slug && (
          <Link href={`/guide/${countyRegion.slug}`} className={styles.card}>
            <span className={styles.cardEyebrow}>Countywide</span>
            {countyRegion.title}
          </Link>
        )}
        {laCity?.slug && (
          <Link href={`/guide/${laCity.slug}`} className={styles.card}>
            <span className={styles.cardEyebrow}>Local</span>
            {laCity.title}
          </Link>
        )}
        {otherCity?.slug && (
          <Link href={`/guide/${otherCity.slug}`} className={styles.card}>
            <span className={styles.cardEyebrow}>Local</span>
            Other cities
          </Link>
        )}
      </div>

      <p className={styles.courage}>
        Looking for a different county? Check out{' '}
        <a href={COURAGE_CA_HREF} target="_blank" rel="noopener noreferrer">
          Courage CA&apos;s statewide voter guide
        </a>
        .
      </p>

      <div className={styles.legend} id="ratings">
        <p className={styles.legendHead}>{LEGEND_HEAD}</p>
        <p className={styles.legendSub}>{LEGEND_SUB}</p>
        <div className={styles.legendGrid}>
          {CANDIDATE_LEGEND.map((item) => (
            <div key={item.kind} className={styles.legendItem}>
              <RatingBadge kind={item.kind} alwaysFull />
              <p className={styles.legendDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p className={styles.legendSubHead}>For ballot measures</p>
        <div className={styles.legendGrid}>
          {MEASURE_LEGEND.map((item) => (
            <div key={item.kind} className={styles.legendItem}>
              <RatingBadge kind={item.kind} alwaysFull />
              <p className={styles.legendDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="donate" className={styles.give}>
        <p className={styles.giveText}>{DONATE_ASK}</p>
        <a href={DONATE_HREF} target="_blank" rel="noopener noreferrer" className={styles.giveBtn}>
          Chip in →
        </a>
      </div>
    </main>
  )
}
