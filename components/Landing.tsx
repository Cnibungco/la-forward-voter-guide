'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Fragment, useState} from 'react'

import {AddressLookup} from '@/components/AddressLookup'
import {Cta} from '@/components/Cta'
import {EntryCard} from '@/components/EntryCard'
import {useMatch} from '@/components/MatchProvider'
import {RatingLegend} from '@/components/RatingLegend'
import {TrustCallout} from '@/components/TrustCallout'
import {
  ADDRESS_LABEL,
  BALLOT_LOOKUP_STATUS,
  BROWSE_MANUALLY,
  CHECK_REGISTRATION_HREF,
  CHECK_REGISTRATION_LABEL,
  CONTACT_HREF,
  CONTACT_LABEL,
  COUNTYWIDE_EYEBROW,
  COURAGE_CA_HREF,
  DONATE_ASK,
  DONATE_BUTTON_LABEL,
  DONATE_HREF,
  ELECTION_KICKER,
  ENDORSED_HEAD,
  ENDORSED_SUB,
  FACEBOOK_HREF,
  FIND_YOUR_CITY_EYEBROW,
  FIND_YOUR_CITY_LABEL,
  HERO_IMAGE_ALT,
  HERO_SUB,
  HERO_TITLE,
  INSTAGRAM_HREF,
  KEY_DATES,
  KEY_DATES_HEAD,
  LANDING_ABOUT_BODY,
  LANDING_ABOUT_SUMMARY,
  LANDING_LOOKUP_ERROR,
  LEGEND_HEAD,
  LEGEND_SUB,
  LOCAL_EYEBROW,
  MAILING_LIST_HREF,
  MAILING_LIST_LABEL,
  REGISTER_HREF,
  REGISTER_LABEL,
  STATEWIDE_EYEBROW,
  SAMPLE_BALLOT_LABEL,
  type KeyDatePart,
} from '@/lib/copy'
import {endorsedCandidates} from '@/lib/endorsed'
import {isLosAngelesCity, navCities, regionByTier} from '@/lib/regions'
import type {GuideRegion} from '@/lib/types'

import styles from './Landing.module.css'

interface LandingProps {
  regions: GuideRegion[]
  sampleBallotUrl: string | null
  disclaimer: string
}

function KeyDateEvent({parts}: {parts: KeyDatePart[]}) {
  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') return <span key={index}>{part}</span>
        if ('href' in part) {
          return (
            <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">
              {part.label}
            </a>
          )
        }
        return <strong key={index}>{part.strong}</strong>
      })}
    </>
  )
}

export function Landing({regions, sampleBallotUrl, disclaimer}: LandingProps) {
  const router = useRouter()
  const {lookupAddress, status} = useMatch()
  const [heroFailed, setHeroFailed] = useState(false)

  const stateRegion = regionByTier(regions, 'state')
  const countyRegion = regionByTier(regions, 'county')
  const laCity = regions.find(isLosAngelesCity)
  const hasCities = navCities(regions).length > 0
  const endorsed = endorsedCandidates(regions)

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

      <section className={styles.datesCard} aria-labelledby="key-dates-heading">
        <div className={styles.datesAccent} aria-hidden="true">
          <span />
          <span />
        </div>
        <h2 id="key-dates-heading" className={styles.datesHead}>
          {KEY_DATES_HEAD}
        </h2>
        <ol className={styles.dates}>
          {KEY_DATES.map((item) => (
            <li
              key={item.date}
              className={item.electionDay ? `${styles.dateRow} ${styles.electionDay}` : styles.dateRow}
            >
              <span className={styles.dateWhen}>{item.date}</span>
              <span className={styles.dateEvent}>
                <KeyDateEvent parts={item.event} />
              </span>
            </li>
          ))}
        </ol>
        <div className={styles.dateActions}>
          <Cta href={CHECK_REGISTRATION_HREF} external className={styles.dateBtn}>
            {CHECK_REGISTRATION_LABEL}
          </Cta>
          <Cta href={REGISTER_HREF} external className={styles.dateBtn}>
            {REGISTER_LABEL}
          </Cta>
        </div>
      </section>

      <details className={styles.noteCard}>
        <summary className={styles.noteToggle}>
          <span>{LANDING_ABOUT_SUMMARY}</span>
          <span className={styles.noteChev} aria-hidden="true" />
        </summary>
        <div className={styles.noteBody}>
          <p>{disclaimer}</p>
          {LANDING_ABOUT_BODY.map((paragraph, index) => (
            <Fragment key={paragraph.slice(0, 32)}>
              <p>{paragraph}</p>
              {index === 1 ? <TrustCallout /> : null}
            </Fragment>
          ))}
          {sampleBallotUrl && (
            <p>
              <a href={sampleBallotUrl} target="_blank" rel="noopener noreferrer">
                {SAMPLE_BALLOT_LABEL} ↗
              </a>
            </p>
          )}
        </div>
      </details>

      <div className={styles.addressCard}>
        <p className={styles.addressLabel}>{ADDRESS_LABEL}</p>
        <AddressLookup onSelect={handleAddressSelected} />
        {status === 'loading' && <p className={styles.status}>{BALLOT_LOOKUP_STATUS}</p>}
        {status === 'error' && (
          <p className={styles.statusError}>
            {LANDING_LOOKUP_ERROR}
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

        <div className={styles.orRow}>
          <span className={styles.orLine} />
          <span className={styles.orText}>{BROWSE_MANUALLY}</span>
          <span className={styles.orLine} />
        </div>

        <div className={styles.cards}>
        {stateRegion?.slug && (
          <Link href={`/guide/${stateRegion.slug}`} className={styles.card}>
            <span className={styles.cardBody}>
              <span className={styles.cardEyebrow}>{STATEWIDE_EYEBROW}</span>
              {stateRegion.title}
            </span>
            <span className={styles.cardChev} aria-hidden="true" />
          </Link>
        )}
        {countyRegion?.slug && (
          <Link href={`/guide/${countyRegion.slug}`} className={styles.card}>
            <span className={styles.cardBody}>
              <span className={styles.cardEyebrow}>{COUNTYWIDE_EYEBROW}</span>
              {countyRegion.title}
            </span>
            <span className={styles.cardChev} aria-hidden="true" />
          </Link>
        )}
        {laCity?.slug && (
          <Link href={`/guide/${laCity.slug}`} className={styles.card}>
            <span className={styles.cardBody}>
              <span className={styles.cardEyebrow}>{LOCAL_EYEBROW}</span>
              {laCity.title}
            </span>
            <span className={styles.cardChev} aria-hidden="true" />
          </Link>
        )}
        {hasCities && (
          <Link href="/cities" className={styles.card}>
            <span className={styles.cardBody}>
              <span className={styles.cardEyebrow}>{FIND_YOUR_CITY_EYEBROW}</span>
              {FIND_YOUR_CITY_LABEL}
            </span>
            <span className={styles.cardChev} aria-hidden="true" />
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
      </div>

      {endorsed.length > 0 && (
        <section className={styles.endorse} aria-labelledby="endorsed-heading">
          <h2 id="endorsed-heading" className={styles.sectionHead}>
            {ENDORSED_HEAD}
          </h2>
          <p className={styles.endorseSub}>{ENDORSED_SUB}</p>
          {endorsed.map((item) => (
            <EntryCard
              key={item.entry._id}
              entry={item.entry}
              label={`${item.entry.name} · ${item.raceTitle}`}
            />
          ))}
        </section>
      )}

      <div className={styles.legend} id="ratings">
        <p className={styles.legendHead}>{LEGEND_HEAD}</p>
        <p className={styles.legendSub}>{LEGEND_SUB}</p>
        <RatingLegend />
      </div>

      <div id="donate" className={styles.give}>
        <p className={styles.giveText}>{DONATE_ASK}</p>
        <Cta href={DONATE_HREF} external variant="donate" size="compact">
          {DONATE_BUTTON_LABEL}
        </Cta>
      </div>

      <footer className={styles.community}>
        <div className={styles.communityLinks}>
          <Cta href={MAILING_LIST_HREF} external className={styles.dateBtn}>
            {MAILING_LIST_LABEL}
          </Cta>
          <Cta href={CONTACT_HREF} external className={styles.dateBtn}>
            {CONTACT_LABEL}
          </Cta>
        </div>
        <div className={styles.socials}>
          <a
            href={FACEBOOK_HREF}
            className={styles.social}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LA Forward on Facebook"
          >
            <svg viewBox="0 0 320 512" aria-hidden="true" className={styles.socialIconFacebook}>
              <path
                fill="currentColor"
                d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
              />
            </svg>
          </a>
          <a
            href={INSTAGRAM_HREF}
            className={`${styles.social} ${styles.socialInstagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LA Forward on Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialIcon}>
              <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  )
}
