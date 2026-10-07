/**
 * Staff-editable strings for the public guide. Keep election-cycle copy
 * here so a non-engineer can change one line without hunting through
 * components. Visual/layout chrome stays in CSS.
 */

export const ELECTION_KICKER = 'November 3, 2026 General Election'

export const HERO_TITLE = 'Know your ballot before you walk in.'

export const HERO_SUB =
  'Every race and measure across LA, rated in plain language by your neighbors at LA Forward.'

export const VIEW_GUIDE_LABEL = 'View the Guide'

export const HERO_IMAGE_SRC = '/banner.jpg'

export const HERO_IMAGE_WIDTH = 1920

export const HERO_IMAGE_HEIGHT = 960

export const HERO_IMAGE_ALT =
  'Illustrated banner for the 2026 General Election LA Forward Voter Guide, showing neighbors carrying ballots'

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

export const ENDORSEMENTS_BANNER_SRC = '/endorsements.jpg'

export const ENDORSEMENTS_BANNER_WIDTH = 1920

export const ENDORSEMENTS_BANNER_HEIGHT = 960

export const ENDORSEMENTS_BANNER_ALT =
  'LA Forward endorses Barri Worth Girvan for LA City Council District 3, Marissa Roy for LA City Attorney, Nithya Raman for Mayor of LA City, and Estuardo Mazariegos for LA City Council District 9.'

export const ORG_HREF = 'https://www.laforward.org'

export const DONATE_HREF = 'https://secure.actblue.com/donate/lafvg'

export const MAILING_LIST_LABEL = 'Get on our mailing list'

export const MAILING_LIST_HREF = 'https://www.laforward.org/newsletter'

export const CONTACT_LABEL = 'Contact us'

export const CONTACT_HREF = 'https://www.laforward.org/contact'

export const INSTAGRAM_HREF = 'https://www.instagram.com/laforward'

export const BLUESKY_HREF = 'https://bsky.app/profile/laforward.org'

export const TIKTOK_HREF = 'https://www.tiktok.com/@laforward'

export const LINKEDIN_HREF =
  'https://www.linkedin.com/company/la-forward/posts/?feedView=all'

export const DONATE_POPUP_TITLE = 'Support LA Forward'

export const DONATE_POPUP_BODY =
  "If this voter guide has been useful for you, we'd be grateful for a donation of any amount to help cover the costs of making it every election!"

export const DONATE_POPUP_DISMISS = 'Not now'

export const COURAGE_CA_HREF = 'https://couragecalifornia.org'

export const TRUST_STATEMENT =
  'Candidates and ballot measure committees were not given the opportunity to pay for preferential treatment and were not shown these recommendations before they were published.'

export const METHODOLOGY_SUMMARY = 'About this guide and how we research candidates'

export const METHODOLOGY_BODY =
  'Volunteers research every contested race and measure directly: public filings, voting records, community group positions, and direct outreach to campaigns. We rate every entry, including when we land on No Recommendation, and we publish our reasoning for all of it.'

export const LANDING_ABOUT_SUMMARY = 'About this guide and how we arrived at our recommendations'

export const TRANSLATE_NOTE = 'Translations are automatic and may not be perfect.'

export const LANDING_ABOUT_BODY = [
  'LA Forward is dedicated to democracy. We support policies and power-building to make Los Angeles County a fair, flourishing place for everyone.',
  "We've been publishing detailed voter guides every election since we launched in Fall 2016. Our local candidate endorsements are the result of a multi-step process. For all other candidates and measures, the recommendations here were written by a team of volunteers and staff. Our team consulted publicly available media coverage, candidate and organizational websites, and conducted interviews with people in our networks and on the ground to make our decisions and complete our write-ups.",
  "If this voter guide has been useful for you, we'd be grateful for a donation of any amount to help cover the costs of making it every election! More than 75% of our budget comes from small-dollar donations from people like you.",
  TRANSLATE_NOTE,
]

export const ADDRESS_LABEL = 'Find your ballot'

export const HOME_ADDRESS_LABEL = 'Home address'

export const ADDRESS_PLACEHOLDER = 'Start typing your address'

export const ADDRESS_PICK_HINT = 'Start typing, then tap your address in the list.'

export const ADDRESS_LOOKUP_UNAVAILABLE =
  "Address lookup isn't available right now. You can still browse the guide by city."

export const PRIVACY_NOTE =
  "We match this to your district, then don't store it, not in a database, not in analytics, not in a log."

export const FIND_YOUR_CITY_LABEL = 'Find your city'

export const GUIDE_SEARCH_LABEL = 'Search the guide'

export const GUIDE_SEARCH_EMPTY = 'Nothing matches that search.'

export const STATEWIDE_EYEBROW = 'Statewide'

export const COUNTYWIDE_EYEBROW = 'Countywide'

export const LOCAL_EYEBROW = 'Citywide'

/** Distinct from LOCAL_EYEBROW so the LA card and the city list aren't both "Citywide". */
export const FIND_YOUR_CITY_EYEBROW = 'LA County Cities'

export const CITIES_TITLE = 'Find your city'

export const CITIES_BODY = 'Search or scroll to your city, then tap it to see that ballot.'

export const CITIES_EMPTY = 'No cities match that search.'

export const NAV_STATE_COUNTY = 'State & county'

export const NAV_STATE_EMPTY = 'No state or county matches that search.'

export const BROWSE_MANUALLY = 'or browse manually'

export const JUMP_TO_LABEL = 'Jump to'

export const RACES_LABEL = 'Races'

export const MEASURES_LABEL = 'Ballot measures'

export const REGION_EMPTY = 'Nothing entered for this region yet.'

export const ENTRY_NO_REASONING = 'No reasoning published yet.'

export const LANDING_LOOKUP_ERROR =
  'Something went wrong looking up that address. Browse a jurisdiction below. Nothing about it was stored.'

export const CITIES_NONE = 'No city guides have been published yet.'

export const TAP_HINT = 'Tap a name to read why.'

export const TAP_HINT_MEASURE = 'Tap a Ballot Measure to read why.'

export const BALLOT_EMPTY = 'No races or measures match your address in this guide.'

export const SHOW_EVERYTHING_LABEL = 'Show everything'

export const SHOW_ONLY_MY_BALLOT_LABEL = 'Show only my ballot'

export const BALLOT_FILTERING_COPY = 'Showing the races and measures that apply to this address.'

export const BALLOT_FULL_COPY = 'Showing every race and measure in the guide.'

export const OPEN_CITY_LIST_LABEL = 'Search the guide'

export const CLOSE_CITY_LIST_LABEL = 'Close search'

export const DONATE_BUTTON_LABEL = 'Donate'

export const EMPTY_GUIDE_COPY = 'Nothing has been published yet. Please check back soon.'

export const NOT_FOUND_TITLE = "We can't find that page."

export const NOT_FOUND_BODY = 'It may have moved. Head home or find your city.'

export const NOT_FOUND_HOME = 'Back to home'

export const LOAD_ERROR_TITLE = "We couldn't load the guide."

export const LOAD_ERROR_BODY =
  'The connection dropped while loading recommendations. Try again in a moment.'

export const TRY_AGAIN_LABEL = 'Try again'

export const NO_REC_LEGEND_NOTE =
  'Gray labels are real ratings, not missing write-ups. “Write-up coming soon” means we have not published yet.'

export function ballotCityImprecision(cityTitle: string): string {
  return `We matched ${cityTitle}, but not every local district yet, so this city's full local list is included.`
}

export const BALLOT_ADDRESS_PREFIX = 'For'

export const CHANGE_ADDRESS_LABEL = 'Change address'

export const CANCEL_CHANGE_ADDRESS_LABEL = 'Cancel'

export const BALLOT_CHANGE_ERROR =
  'Something went wrong looking up that address. Your current ballot is unchanged. Nothing about it was stored.'

export const BALLOT_LOOKUP_STATUS = 'Looking up your ballot…'

export const DONATE_ASK =
  'Over 75% of our budget comes from small-dollar gifts like yours. No corporate money, no strings.'

export const SHARE_HEAD = 'Share this Voter Guide'

/** Header control on narrow screens. The dialog title stays SHARE_HEAD. */
export const SHARE_HEADER_SHORT = 'Share'

export const SHARE_CLOSE_LABEL = 'Close'

export const SHARE_BODY = 'Download the graphic, or share it with a short line already filled in.'

export const SHARE_TEXT = 'I just used this Voter Guide!'

export const SHARE_TITLE = 'LA Forward Voter Guide'

export const SHARE_BUTTON_LABEL = 'Share'

export const SHARE_COPY_LABEL = 'Copy link'

export const SHARE_COPIED_LABEL = 'Link copied'

export const SHARE_COPY_MANUAL = 'Select and copy this link.'

export const SHARE_DOWNLOAD_LABEL = 'Download graphic'

/**
 * Designed share graphic (2:1 banner). Keep the download filename extension
 * in sync with this file. Width and height match the file's pixel size so
 * the share dialog doesn't reserve the wrong box.
 */
export const SHARE_GRAPHIC_SRC = '/banner.jpg'

export const SHARE_GRAPHIC_WIDTH = 1920

export const SHARE_GRAPHIC_HEIGHT = 960

export const SHARE_GRAPHIC_DOWNLOAD = 'la-forward-voter-guide.jpg'

/**
 * Legally required campaign footer, rendered once from the root layout.
 * Wording must match counsel's copy. Donor name and amount are the fields
 * most likely to change. The address link is a Google Maps search until a
 * confirmed maps URL replaces it. The `#` in the street address is
 * percent-encoded so it stays in the query string.
 */
export const CAMPAIGN_DISCLAIMER = {
  paidForPrefix: 'Paid for LA Forward Action Fund, ',
  address: '2012 Business Center Dr #130 Irvine, CA 92612',
  addressHref:
    'https://www.google.com/maps/search/?api=1&query=2012%20Business%20Center%20Dr%20%23130%20Irvine%2C%20CA%2092612',
  majorFundingBy: 'Major Funding by:',
  donor: 'Elizabeth Thomas in the amount of $5,000',
  notAuthorized: 'Not Authorized by any candidate or a committee controlled by a candidate.',
  fundingDetailsPrefix: 'Funding details at ',
  ethicsLabel: 'ethics.lacity.gov',
  ethicsHref: 'https://ethics.lacity.gov',
} as const

export const LEGEND_HEAD = 'Our ratings, in full'

export const LEGEND_SUB =
  'Every race and measure gets one of these. We write out our reasoning for all of them, including when we don\'t have a strong opinion.'

export const LEGEND_TRIGGER = 'What do the ratings mean?'

export const MEASURE_LEGEND_HEAD = 'For ballot measures'

export const OUTSIDE_EYEBROW = 'Outside LA County'

export const OUTSIDE_TITLE = "That address isn't in our coverage area, but you're not stuck."

export const OUTSIDE_BODY =
  "We only cover LA County races and measures right now, so we couldn't match that address to a ballot. Nothing about it was stored. Statewide, county, and Los Angeles guides are still available."

export const DEFAULT_DISCLAIMER =
  'These are races and measures where LA Forward has made recommendations.'

export const SAMPLE_BALLOT_LABEL = 'Official LA County sample ballot'

export const COMING_SOON_LABEL = 'Write-up coming soon'
