/**
 * Staff-editable strings for the public guide. Keep election-cycle copy
 * here so a non-engineer can change one line without hunting through
 * components. Visual/layout chrome stays in CSS.
 */

export const ELECTION_KICKER = 'November 3, 2026 General Election'

export const HERO_TITLE = 'Know your ballot before you walk in.'

export const HERO_SUB =
  'Every race and measure across LA, rated in plain language by your neighbors at LA Forward.'

export const HERO_IMAGE_ALT =
  'LA Forward volunteers and community members at an organizing event'

export const LAVOTE_HREF = 'https://www.lavote.gov'

export const REGISTER_HREF = 'https://registertovote.ca.gov/'

export const CHECK_REGISTRATION_HREF = 'https://voterstatus.sos.ca.gov'

export const EARLY_VOTING_HREF = 'https://caearlyvoting.sos.ca.gov/'

export const REGISTER_LABEL = 'Register to vote'

export const CHECK_REGISTRATION_LABEL = 'Check registration'

export const KEY_DATES_HEAD = 'Key dates'

export type KeyDatePart = string | {href: string; label: string} | {strong: string}

export interface KeyDate {
  date: string
  event: KeyDatePart[]
  electionDay?: boolean
}

/** Voter-facing dates for the Nov 3, 2026 general. Edit here each cycle. */
export const KEY_DATES: KeyDate[] = [
  {
    date: 'OCT 5',
    event: [
      'Ballots mailed to all active registered voters. You can also pick up a ballot (or drop one off) at an ',
      {href: EARLY_VOTING_HREF, label: 'Early Voting site'},
      '.',
    ],
  },
  {
    date: 'OCT 6',
    event: ['Secure ballot drop-off boxes open.'],
  },
  {
    date: 'OCT 19',
    event: [
      {
        strong:
          'Last day to register to vote (or update your registration address) online to receive your ballot by mail. ',
      },
      'After October 19, you must complete same-day voter registration and request your ballot in person at a vote center.',
    ],
  },
  {
    date: 'OCT 24',
    event: ['Vote centers open across LA County to vote or drop off your ballot.'],
  },
  {
    date: 'OCT 27',
    event: [
      {href: LAVOTE_HREF, label: 'Last recommended day'},
      ' to mail your ballot at the post office.',
    ],
  },
  {
    date: 'NOV 3',
    event: ['Election Day'],
    electionDay: true,
  },
]

export const ENDORSED_HEAD = 'Endorsed candidates'

export const ENDORSED_SUB = 'Candidates LA Forward is backing without reservation.'

export const ORG_HREF = 'https://www.laforward.org'

export const DONATE_HREF = 'https://www.laforward.org/donate'

export const COURAGE_CA_HREF = 'https://couragecalifornia.org'

export const TRUST_STATEMENT =
  'Candidates and ballot measure committees were not given the opportunity to pay for preferential treatment and were not shown these recommendations before they were published.'

export const METHODOLOGY_SUMMARY = 'About this guide and how we research candidates'

export const METHODOLOGY_BODY =
  'Volunteers research every contested race and measure directly: public filings, voting records, community group positions, and direct outreach to campaigns. We rate every entry, including when we land on No Recommendation, and we publish our reasoning for all of it.'

export const LANDING_ABOUT_SUMMARY = 'About this guide and how we arrived at our recommendations'

export const LANDING_ABOUT_BODY = [
  'LA Forward is dedicated to democracy. We support policies and power-building to make Los Angeles County a fair, flourishing place for everyone.',
  "We've been publishing detailed voter guides every election since we launched in Fall 2016. Our local candidate endorsements are the result of a multi-step process. For all other candidates and measures, the recommendations here were written by a team of volunteers and staff. Our team consulted publicly available media coverage, candidate and organizational websites, and conducted interviews with people in our networks and on the ground to make our decisions and complete our write-ups. Candidates and ballot measure committees were not given the opportunity to pay for preferential treatment and were not shown these recommendations before they were published.",
  "If this voter guide has been useful for you, we'd be grateful for a donation of any amount to help cover the costs of making it every election! More than 75% of our budget comes from small-dollar donations from people like you.",
]

export const ADDRESS_LABEL = 'Find your ballot'

export const PRIVACY_NOTE =
  "We match this to your district, then don't store it, not in a database, not in analytics, not in a log."

export const DONATE_ASK =
  'Over 75% of our budget comes from small-dollar gifts like yours. No corporate money, no strings.'

export const LEGEND_HEAD = 'Our ratings, in full'

export const LEGEND_SUB =
  'Every race and measure gets one of these. We write out our reasoning for all of them, including when we don\'t have a strong opinion.'

export const LEGEND_TRIGGER = 'What do the ratings mean?'

export const OUTSIDE_EYEBROW = 'Outside LA County'

export const OUTSIDE_TITLE = "That address isn't in our coverage area, but you're not stuck."

export const OUTSIDE_BODY =
  "We only cover LA County races and measures right now, so we couldn't match that address to a ballot. Nothing about it was stored. Browse the full guide below, or jump straight to a jurisdiction."

export const DEFAULT_DISCLAIMER =
  'These are races and measures where LA Forward has made recommendations.'

export const SAMPLE_BALLOT_LABEL = 'Full county sample ballot'

export const COMING_SOON_LABEL = 'Recommendation coming soon'
