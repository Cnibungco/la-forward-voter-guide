import type {PortableTextBlock, PortableTextSpan} from '@portabletext/types'

import {
  CAMPAIGN_DISCLAIMER,
  DEFAULT_DISCLAIMER,
  DONATE_ASK,
  KEY_DATES,
  LANDING_ABOUT_BODY,
  LANDING_ABOUT_SUMMARY,
  TRUST_STATEMENT,
  type KeyDatePart,
} from '@/lib/copy'
import {safeHref} from '@/lib/safeHref'
import type {SiteKeyDate, SiteSettings} from '@/lib/types'

export function resolvedDisclaimer(settings: SiteSettings | null | undefined): string {
  return settings?.disclaimer?.trim() || DEFAULT_DISCLAIMER
}

export function resolvedSampleBallotUrl(settings: SiteSettings | null | undefined): string | null {
  const url = settings?.sampleBallotUrl?.trim()
  return url || null
}

export interface ResolvedAnnouncement {
  text: string
  label: string | null
  href: string | null
}

/**
 * A blank announcement stays hidden. The link is included only when both
 * a label and a safe URL are set.
 */
export function resolvedAnnouncement(
  settings: SiteSettings | null | undefined,
): ResolvedAnnouncement | null {
  const text = settings?.announcement?.trim()
  if (!text) return null
  const label = settings?.announcementLinkLabel?.trim() || null
  const href = safeHref(settings?.announcementLinkUrl) ?? null
  if (!label || !href) return {text, label: null, href: null}
  return {text, label, href}
}

export interface ResolvedKeyDate {
  key: string
  date: string
  event: PortableTextBlock[]
  electionDay: boolean
}

function eventBlocks(parts: KeyDatePart[], key: string): PortableTextBlock[] {
  const markDefs: {_key: string; _type: 'link'; href: string}[] = []
  const children: PortableTextSpan[] = parts.map((part, index) => {
    const spanKey = `${key}-s${index}`
    if (typeof part === 'string') {
      return {_type: 'span', _key: spanKey, text: part, marks: []}
    }
    if ('strong' in part) {
      return {_type: 'span', _key: spanKey, text: part.strong, marks: ['strong']}
    }
    const markKey = `${key}-a${index}`
    markDefs.push({_key: markKey, _type: 'link', href: part.href})
    return {_type: 'span', _key: spanKey, text: part.label, marks: [markKey]}
  })

  return [
    {
      _type: 'block',
      _key: `${key}-b`,
      style: 'normal',
      markDefs,
      children,
    },
  ]
}

function fallbackKeyDates(): ResolvedKeyDate[] {
  return KEY_DATES.map((item) => ({
    key: item.date,
    date: item.date,
    event: eventBlocks(item.event, item.date),
    electionDay: item.electionDay === true,
  }))
}

function blockHasText(blocks: PortableTextBlock[] | null | undefined): boolean {
  return (blocks ?? []).some((block) =>
    (block.children ?? []).some(
      (child) => 'text' in child && typeof child.text === 'string' && child.text.trim().length > 0,
    ),
  )
}

function resolvedKeyDate(item: SiteKeyDate, index: number): ResolvedKeyDate | null {
  const date = item.date?.trim()
  if (!date || !blockHasText(item.event)) return null
  return {
    key: item._key || `${date}-${index}`,
    date,
    event: item.event ?? [],
    electionDay: item.electionDay === true,
  }
}

/** An empty or missing list keeps the original November 2026 dates. */
export function resolvedKeyDates(settings: SiteSettings | null | undefined): ResolvedKeyDate[] {
  const dates = (settings?.keyDates ?? [])
    .map(resolvedKeyDate)
    .filter((item): item is ResolvedKeyDate => item !== null)
  return dates.length > 0 ? dates : fallbackKeyDates()
}

export function resolvedAboutSummary(settings: SiteSettings | null | undefined): string {
  return settings?.aboutSummary?.trim() || LANDING_ABOUT_SUMMARY
}

export function resolvedAboutParagraphs(settings: SiteSettings | null | undefined): string[] {
  const paragraphs = (settings?.aboutParagraphs ?? [])
    .map((item) => item?.text?.trim() ?? '')
    .filter((text) => text.length > 0)
  return paragraphs.length > 0 ? paragraphs : [...LANDING_ABOUT_BODY]
}

export function resolvedTrustStatement(settings: SiteSettings | null | undefined): string {
  return settings?.trustStatement?.trim() || TRUST_STATEMENT
}

/**
 * Index of the about paragraph the trust callout follows.
 * Null when there are no paragraphs, so the caller renders the callout after the list.
 */
export function trustCalloutAfter(paragraphCount: number): number | null {
  if (paragraphCount <= 0) return null
  return paragraphCount >= 2 ? 1 : paragraphCount - 1
}

export function resolvedDonateAsk(settings: SiteSettings | null | undefined): string {
  return settings?.donateAsk?.trim() || DONATE_ASK
}

export function resolvedCampaignDonor(settings: SiteSettings | null | undefined): string {
  return settings?.campaignDonor?.trim() || CAMPAIGN_DISCLAIMER.donor
}

export interface ResolvedHomeCopy {
  announcement: ResolvedAnnouncement | null
  keyDates: ResolvedKeyDate[]
  aboutSummary: string
  aboutParagraphs: string[]
  trustStatement: string
  /** Paragraph index the trust callout follows. Null when there are no paragraphs. */
  trustAfter: number | null
  donateAsk: string
}

export function resolvedHomeCopy(settings: SiteSettings | null | undefined): ResolvedHomeCopy {
  const aboutParagraphs = resolvedAboutParagraphs(settings)
  return {
    announcement: resolvedAnnouncement(settings),
    keyDates: resolvedKeyDates(settings),
    aboutSummary: resolvedAboutSummary(settings),
    aboutParagraphs,
    trustStatement: resolvedTrustStatement(settings),
    trustAfter: trustCalloutAfter(aboutParagraphs.length),
    donateAsk: resolvedDonateAsk(settings),
  }
}
