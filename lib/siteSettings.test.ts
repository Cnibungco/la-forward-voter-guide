import type {PortableTextBlock} from '@portabletext/types'
import {describe, expect, it} from 'vitest'

import {
  CAMPAIGN_DISCLAIMER,
  DEFAULT_DISCLAIMER,
  DONATE_ASK,
  KEY_DATES,
  LANDING_ABOUT_BODY,
  LANDING_ABOUT_SUMMARY,
  TRUST_STATEMENT,
} from '@/lib/copy'
import {
  resolvedAboutParagraphs,
  resolvedAboutSummary,
  resolvedAnnouncement,
  resolvedCampaignDonor,
  resolvedDisclaimer,
  resolvedDonateAsk,
  resolvedKeyDates,
  resolvedSampleBallotUrl,
  resolvedTrustStatement,
  trustCalloutAfter,
} from '@/lib/siteSettings'
import type {SiteSettings} from '@/lib/types'

function block(text: string): PortableTextBlock[] {
  return [
    {
      _type: 'block',
      _key: 'b',
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: 's', text, marks: []}],
    },
  ]
}

const emptySettings: SiteSettings = {disclaimer: null, sampleBallotUrl: null}

describe('resolvedDisclaimer', () => {
  it('falls back when settings are missing or whitespace', () => {
    expect(resolvedDisclaimer(null)).toBe(DEFAULT_DISCLAIMER)
    expect(resolvedDisclaimer({disclaimer: '   ', sampleBallotUrl: null})).toBe(DEFAULT_DISCLAIMER)
  })

  it('uses the CMS string after trimming', () => {
    expect(resolvedDisclaimer({disclaimer: '  City races only.  ', sampleBallotUrl: null})).toBe('City races only.')
  })
})

describe('resolvedSampleBallotUrl', () => {
  it('returns null for missing or whitespace URLs', () => {
    expect(resolvedSampleBallotUrl(null)).toBeNull()
    expect(resolvedSampleBallotUrl({disclaimer: null, sampleBallotUrl: '  '})).toBeNull()
  })

  it('returns a trimmed URL', () => {
    expect(resolvedSampleBallotUrl({disclaimer: null, sampleBallotUrl: '  https://lavote.gov/sample  '})).toBe(
      'https://lavote.gov/sample',
    )
  })
})

describe('resolvedAnnouncement', () => {
  it('stays hidden when the text is missing or blank', () => {
    expect(resolvedAnnouncement(null)).toBeNull()
    expect(resolvedAnnouncement(emptySettings)).toBeNull()
    expect(resolvedAnnouncement({...emptySettings, announcement: '   '})).toBeNull()
  })

  it('shows the text without a link unless both label and URL are set', () => {
    expect(resolvedAnnouncement({...emptySettings, announcement: '  Polls moved.  '})).toEqual({
      text: 'Polls moved.',
      label: null,
      href: null,
    })
    expect(
      resolvedAnnouncement({
        ...emptySettings,
        announcement: 'Polls moved.',
        announcementLinkLabel: 'Details',
      }),
    ).toEqual({text: 'Polls moved.', label: null, href: null})
  })

  it('includes a trimmed link and drops unsafe URLs', () => {
    expect(
      resolvedAnnouncement({
        ...emptySettings,
        announcement: 'Polls moved.',
        announcementLinkLabel: '  Details  ',
        announcementLinkUrl: '  https://www.lavote.gov  ',
      }),
    ).toEqual({text: 'Polls moved.', label: 'Details', href: 'https://www.lavote.gov'})
    expect(
      resolvedAnnouncement({
        ...emptySettings,
        announcement: 'Polls moved.',
        announcementLinkLabel: 'Details',
        announcementLinkUrl: 'javascript:alert(1)',
      }),
    ).toEqual({text: 'Polls moved.', label: null, href: null})
  })
})

describe('resolvedKeyDates', () => {
  it('falls back when the list is missing, empty, or only blank rows', () => {
    expect(resolvedKeyDates(null).map((item) => item.date)).toEqual(KEY_DATES.map((item) => item.date))
    expect(resolvedKeyDates({...emptySettings, keyDates: []}).map((item) => item.date)).toEqual(
      KEY_DATES.map((item) => item.date),
    )
    expect(
      resolvedKeyDates({
        ...emptySettings,
        keyDates: [{_key: 'blank', date: '   ', event: block('Nope'), electionDay: false}],
      }).map((item) => item.date),
    ).toEqual(KEY_DATES.map((item) => item.date))
    expect(resolvedKeyDates(null).find((item) => item.date === 'NOV 3')?.electionDay).toBe(true)
  })

  it('uses a populated CMS list, including the Election Day highlight', () => {
    const dates = resolvedKeyDates({
      ...emptySettings,
      keyDates: [
        {_key: 'a', date: '  DEC 1  ', event: block('Ballots drop.'), electionDay: false},
        {_key: 'b', date: 'DEC 8', event: block('Election Day'), electionDay: true},
      ],
    })
    expect(dates).toEqual([
      {key: 'a', date: 'DEC 1', event: block('Ballots drop.'), electionDay: false},
      {key: 'b', date: 'DEC 8', event: block('Election Day'), electionDay: true},
    ])
  })
})

describe('resolved about, donate, and donor copy', () => {
  it('falls back when the fields are missing or blank', () => {
    expect(resolvedAboutSummary(null)).toBe(LANDING_ABOUT_SUMMARY)
    expect(resolvedAboutParagraphs({...emptySettings, aboutParagraphs: []})).toEqual([...LANDING_ABOUT_BODY])
    expect(resolvedTrustStatement({...emptySettings, trustStatement: '  '})).toBe(TRUST_STATEMENT)
    expect(resolvedDonateAsk(null)).toBe(DONATE_ASK)
    expect(resolvedCampaignDonor({...emptySettings, campaignDonor: ''})).toBe(CAMPAIGN_DISCLAIMER.donor)
  })

  it('uses trimmed CMS copy', () => {
    expect(resolvedAboutSummary({...emptySettings, aboutSummary: '  Why we publish  '})).toBe('Why we publish')
    expect(
      resolvedAboutParagraphs({
        ...emptySettings,
        aboutParagraphs: [
          {_key: '1', text: '  First.  '},
          {_key: '2', text: '   '},
          {_key: '3', text: 'Second.'},
        ],
      }),
    ).toEqual(['First.', 'Second.'])
    expect(resolvedTrustStatement({...emptySettings, trustStatement: '  We do not sell placement.  '})).toBe(
      'We do not sell placement.',
    )
    expect(resolvedDonateAsk({...emptySettings, donateAsk: '  Chip in.  '})).toBe('Chip in.')
    expect(resolvedCampaignDonor({...emptySettings, campaignDonor: '  Ada Lovelace in the amount of $10  '})).toBe(
      'Ada Lovelace in the amount of $10',
    )
  })
})

describe('trustCalloutAfter', () => {
  it('follows the second paragraph, or the only paragraph when there is just one', () => {
    expect(trustCalloutAfter(0)).toBeNull()
    expect(trustCalloutAfter(1)).toBe(0)
    expect(trustCalloutAfter(4)).toBe(1)
  })
})
