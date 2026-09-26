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
  BLUESKY_HREF,
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
  LINKEDIN_HREF,
  LOCAL_EYEBROW,
  MAILING_LIST_HREF,
  MAILING_LIST_LABEL,
  REGISTER_HREF,
  REGISTER_LABEL,
  SAMPLE_BALLOT_LABEL,
  STATEWIDE_EYEBROW,
  TIKTOK_HREF,
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

function SocialIcon({name}: {name: 'instagram' | 'bluesky' | 'tiktok' | 'linkedin'}) {
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialIcon}>
        <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    )
  }

  const path =
    name === 'bluesky'
      ? 'M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.658 7.078 5.076 5.445 6.794-1.469 7.651-4.876.857 3.407 2.575 10.321 7.651 4.876 4.729-5.073 1.254-6.498-2.658-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z'
      : name === 'tiktok'
        ? 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
        : 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialIcon}>
      <path fill="currentColor" d={path} />
    </svg>
  )
}

const SOCIAL_LINKS = [
  {href: INSTAGRAM_HREF, label: 'LA Forward on Instagram', name: 'instagram' as const, brand: styles.socialInstagram},
  {href: BLUESKY_HREF, label: 'LA Forward on Bluesky', name: 'bluesky' as const, brand: styles.socialBluesky},
  {href: TIKTOK_HREF, label: 'LA Forward on TikTok', name: 'tiktok' as const, brand: styles.socialTiktok},
  {href: LINKEDIN_HREF, label: 'LA Forward on LinkedIn', name: 'linkedin' as const, brand: styles.socialLinkedin},
]

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
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`${styles.social} ${link.brand}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
            >
              <SocialIcon name={link.name} />
            </a>
          ))}
        </div>
      </footer>
    </main>
  )
}
