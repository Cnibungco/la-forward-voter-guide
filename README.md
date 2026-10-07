# LA Forward Voter Guide

Public civic voter guide for [LA Forward](https://www.laforward.org), covering
races and measures in Los Angeles County for the **November 3, 2026 General
Election**. This Next.js app fetches published content from a **standalone**
Sanity Studio. The Studio lives in a sibling repo/folder,
`studio-la-forward-voter-guide`, next to this app — not embedded here, not a
route in this repo. The hosted Studio is
[la-forward-voter-guide.sanity.studio](https://la-forward-voter-guide.sanity.studio).

**Opening this in Cursor:** `.cursor/rules/` has project context that loads
automatically in Agent mode — stack, locked decisions, and conventions, so you
don't need to re-explain the project each session. Full decision history:
`docs/backend-strategy.md` (see §10 for the standalone-Studio amendment).

## Locked decisions (do not relitigate)

- Rating scale: No Recommendation / Recommended / Endorsed
- Measure position: Support / Oppose / No Position
- Studio is standalone (`studio-la-forward-voter-guide`), not embedded
- One nested GROQ query fetches the whole guide (`sanity/lib/queries.ts`)
- Single `production` dataset — no separate testing dataset
- Time-based ISR, 5 min, plus a Sanity webhook so a publish updates the live guide immediately (`SANITY_REVALIDATE_SECRET`; see docs/backend-strategy.md §13)
- Address lookup never stores, logs, or sends the user's address except the
  one server-side Census Geocoder call needed to match it (see
  `docs/address-matching-strategy.md`)

## Public site

Every page has the site header: LA Forward wordmark (not translated) plus a
"Voter Guide" tagline, a language picker (Google Translate), a link to
laforward.org, Share this Voter Guide (opens the graphic dialog; the header
says Share on a narrow screen), and Donate (opens
https://secure.actblue.com/donate/lafvg in a new tab).

| Route | What it is |
|---|---|
| `/` | Landing — see section order below |
| `/cities` | Searchable list of local city guides |
| `/ballot` | Matched (or full) ballot after an address lookup |
| `/guide/[slug]` | One jurisdiction — statewide, county, or a city |
| `/outside` | Address was outside LA County; nothing about it was stored |

Unknown URLs show a not-found page (home or find your city). A dropped
connection while loading recommendations shows a try-again page.

### Landing (`/`)

In order:

1. Hero (kicker: November 3, 2026 General Election). View the Guide opens
   the City of Los Angeles guide, or the first published jurisdiction when
   that city guide is absent.
2. Key dates (cream card; Check registration / Register to vote)
3. About this guide (one accordion, same heading type as Find your ballot).
   The trust statement — candidates and committees were not offered paid
   placement and did not see recommendations before publication — is
   highlighted inside this accordion. There is no site-wide trust banner.
4. Endorsements banner (`public/endorsements.jpg`)
5. Find your ballot (address lookup; privacy note that the address is not
   stored)
6. Browse manually — statewide, countywide, City of Los Angeles, and Find
   your city (`/cities`), plus a link to Courage CA for other counties
7. Ratings legend (full static copy; see Ratings below)
8. Donate (same ActBlue URL as the header)
9. Mailing list and contact (Get on our mailing list, Contact us), then
   Instagram, Bluesky, TikTok, and LinkedIn. Each opens in a new tab.
   No self-service portal and no org disclaimer in this footer.

A donate dialog appears 30 seconds into a browser's first visit, then
stays dismissed. The header, the landing donate block, and that dialog
all open https://secure.actblue.com/donate/lafvg in a new tab.

Footer profiles, also in `lib/copy.ts`:

| Network | URL |
|---|---|
| Instagram | https://www.instagram.com/laforward |
| Bluesky | https://bsky.app/profile/laforward.org |
| TikTok | https://www.tiktok.com/@laforward |
| LinkedIn | https://www.linkedin.com/company/la-forward/posts/?feedView=all |

Staff-editable chrome (disclaimer, county sample-ballot URL) lives in the
Studio **Site Settings** singleton, not in this repo. Election-cycle copy —
hero, key dates, about paragraphs, register/check-registration URLs, the
donate URL, donate ask, donate dialog, mailing list, contact, social
profiles, share text, and the legally required campaign footer
(`CAMPAIGN_DISCLAIMER`) — is in `lib/copy.ts`. The share graphic and the
hero illustration are `public/banner.jpg`. The campaign footer is rendered
once from the root layout, on every public page.

### Guide, ballot, cities, outside

Guide pages (`/guide/[slug]`) show an About this guide accordion, a compact
ratings legend, a tap-to-read hint, then that jurisdiction's races and
measures. Previous/next jurisdiction links follow sidebar order (state →
county → LA City → other cities). First page shows Next only; last page
shows Previous only. A Back to top link appears on long pages. Ballot and
Outside pages do not get previous/next chrome.

`/ballot` is the matched-ballot view after address lookup: change address,
toggle between "only my ballot" and everything, then the same about/legend
pattern. `/cities` is a search-or-scroll list of local city guides.
`/outside` explains that we only cover LA County, offers a new address and
jumps to statewide / county / LA City (and the official sample ballot when
Site Settings has a URL).

Official brand hexes live in `app/globals.css` (`#00285a`, `#003da6`,
`#0681fc`, `#ffa400`, `#ffc845`, `#ffe8b1`). Headings are Barlow Condensed;
body is Work Sans.

## Ratings

Every published candidate and measure gets a rating. All six badges are
rounded pills. Recommended (thumbs up), Endorsed (yellow star), Support
(check), and Oppose (X) use their color. **No Recommendation** and **No
Position** are grey pills with no icon — they are real ratings, not missing
write-ups.

The landing legend intro says we write out our reasoning for all of them,
including when we don't have a strong opinion. Directly under that sits:
"Gray labels are real ratings, not missing write-ups. 'Write-up coming soon'
means we have not published yet." Guide and ballot pages use the same
ratings in a compact "What do the ratings mean?" popover.

Pending items (or published items still missing a rating/position) render as
**Write-up coming soon**, not as a grey rating.

## Content

The November 2026 skeleton is already in the `production` dataset:
statewide props and offices, State Senate/Assembly districts, LA County
measures, City of Los Angeles races and measures, other cities (mostly a
City Council race), and school boards for Palos Verdes USD and Torrance
Unified.

State/County use top-level `race` / `measure` documents that reference a
`region`. City ballots (and school boards) use a Region's or
`specialDistrict`'s `sections` array — see `docs/backend-strategy.md` §11.

**Content status** (on races, measures, entries, and city ballot items) is
independent of Sanity's own draft documents:

- `draft` — hidden from the public guide
- `pending` — shown as "Write-up coming soon"
- `published` — rating/position and the write-up are required and shown. A measure write-up is one text field, not separate pros and cons.

New items default to `pending`. Flip to `published` in Studio when the
write-up is ready. The public site can take up to 5 minutes to catch up
(ISR). Measures without a finished write-up should stay `pending` so they
render the coming-soon row instead of an empty accordion.

## Setup

This app expects `studio-la-forward-voter-guide` to exist as a sibling
folder (same parent directory as this repo) and to already be pointed
at a real Sanity project.

1. `cp .env.example .env.local` and fill in:
   - Sanity project ID / dataset — see the Studio's `sanity.config.ts`
     (currently `wcogcahu` / `production`)
   - `NEXT_PUBLIC_GEOAPIFY_API_KEY` — free tier at
     [geoapify.com](https://www.geoapify.com/). Restrict the key by HTTP
     referrer before production. Without it, address lookup shows "not
     configured"; the rest of the guide still works.
2. `npm install`
3. `npm run dev` → app at `localhost:3000`
4. In the Studio folder (separate terminal): `npm run dev` → Studio at
   `localhost:3333`
5. Deploy this app to Vercel as a normal Next.js app. The Sanity project
   ID defaults to `wcogcahu` (same as the Studio), so you do **not** need
   to set `NEXT_PUBLIC_SANITY_PROJECT_ID` in the Vercel dashboard. For
   address lookup in production, add `NEXT_PUBLIC_GEOAPIFY_API_KEY` under
   Environment Variables (Production and Preview). For Google Analytics,
   add `NEXT_PUBLIC_GA_MEASUREMENT_ID` on **Production only** (not Preview).
   Deploy the Studio separately (`npx sanity deploy` from the Studio
   folder) — the two have independent deploy pipelines. The hosted Studio
   is [la-forward-voter-guide.sanity.studio](https://la-forward-voter-guide.sanity.studio).

   After the first production deploy, enable Web Analytics in the Vercel
   dashboard (project → Analytics → Enable). Hobby includes 50,000 events
   per month; collection pauses at the cap instead of charging.

**Note on `npm run build`:** this does a real fetch to Sanity at build
time (that's what makes the homepage statically generated / ISR-cached
rather than fetched on every request). The build will fail if the project
ID is overridden to a wrong value, or if Sanity is unreachable — that is
expected, not a bug. `sanity/lib/client.ts` still throws if the ID is
blank, rather than silently rendering an empty guide.

**CORS:** the Studio project needs this app's URL allow-listed so the
app's client can read from Sanity. Add `http://localhost:3000` (and the
production URL once deployed) from the Studio folder:
`npx sanity cors add http://localhost:3000 --credentials`, or via
[Sanity Manage](https://www.sanity.io/manage).

## Analytics

Vercel Web Analytics (page views, top pages, referrers) and optional Google
Analytics 4 (campaign / UTM reports) are both free-tier. Neither may receive
the voter's address — page paths are enough; custom events are not used.

**Vercel:** after deploy, project → Analytics → Enable. Data appears in the
Vercel dashboard. Query strings are stripped before a page view is sent, so
a tagged or mistaken query cannot leak an address there.

**Google Analytics:** set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-XXXXXXXX`) in
Vercel Production. The script does not load without it, and does not load
in development or preview. In GA4 Admin → Data collection → Enhanced
Measurement, turn **off form interactions** (the address field is a form).
Leave **page changes based on browser history events** on so in-app
navigations count. Campaign reports: Acquisition → Traffic acquisition.

**Campaign links:** tag URLs you share or print, or email and flyer traffic
shows up as "direct":

`https://<production-host>/?utm_source=instagram&utm_medium=social&utm_campaign=nov-2026`

| Parameter | Use | Examples |
|---|---|---|
| `utm_source` | Where the link lives | `instagram`, `email`, `flyer` |
| `utm_medium` | Channel | `social`, `email`, `print` |
| `utm_campaign` | The push | `nov-2026`, `oct-townhall` |

Do not put street addresses or people's names in UTM values.

## Dataset: production only, no testing dataset

There is no sandbox dataset. Whatever editors publish in Studio is what
the live site will show after the next ISR refresh. Use
`contentStatus: draft` to keep unfinished items off the public guide
without needing a second dataset.

## Testing

`npm test` runs the Vitest suite. There is no mocked Sanity client —
tests cover app logic, not CMS content.

### Accessibility

Target is **WCAG 2.2 Level AA**. `npm run lint` already includes
`eslint-plugin-jsx-a11y` via `eslint-config-next`.

`npm run test:a11y` runs Playwright + axe against the public routes (`/`,
`/cities`, one `/guide/[slug]`, `/ballot`, `/outside`, and a 404). It fails
only on **critical** and **serious** findings. Google Translate and the
Geoapify suggestion list are excluded — those widgets are third-party DOM
we patch around, not something to "fix" in this repo.

First-time setup (once per machine):

```
npx playwright install chromium
```

The script starts `next dev` on port 3000 if nothing is already there, or
reuses a running app. To scan a server you already started:

```
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:a11y
```

`/ballot` is seeded with a district match in `sessionStorage` (same shape
as a real lookup). The street address is never typed or stored.

Axe does not replace a keyboard or screen-reader pass. After changing
`AddressLookup`, `GuideShell`, or `GoogleTranslate`, tab through the
header and that widget, and (on a Mac) run VoiceOver over the landing
hero, address field, one expanded candidate, and the language picker.
A GitHub Action for this script is optional later — run it locally before
a release until then.

Address matching (`lib/districtMatching.test.ts`,
`app/api/match-ballot/route.test.ts`) covers at-large cities,
unincorporated county, out-of-county rejection, and the privacy guarantee
that the submitted address is never logged. A couple of cases hit the real
files in `data/boundaries/*.geojson` for known addresses, so a bad
boundary-file edit fails a test. District matches may be kept in this
tab's session storage; the street address is not.

Other suites: sidebar order and previous/next helpers (`lib/regions.test.ts`);
when Back to top appears (`lib/contentLength.test.ts`); analytics URL redaction
(`lib/analytics.test.ts`); rating copy and icons, pending vs
published display, address widget wrapper, payload defaults, Site Settings
fallbacks, and transient fetch retries.

## Still deferred

- `sanity typegen` for auto-generated query types — `lib/types.ts` is
  kept in sync with `GUIDE_QUERY` by hand. Worth adding once the schema
  is done shifting.
- Endorsement write-ups — the skeleton is in Studio; ratings, reasoning,
  and candidate photos still get filled in there as research lands.
