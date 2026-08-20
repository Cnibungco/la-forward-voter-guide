# LA Forward Voter Guide

Next.js app that fetches published content from a **standalone** Sanity
Studio. The Studio lives in a sibling repo/folder,
`studio-la-forward-voter-guide`, next to this app — not embedded here,
not a route in this repo.

**Opening this in Cursor:** `.cursor/rules/` has project context that
loads automatically in Agent mode — stack, locked decisions, and
conventions, so you don't need to re-explain the project each session.
Full decision history and reasoning: `docs/backend-strategy.md` (see
§10 for the standalone-Studio amendment).

## Confirmed decisions baked into this build

- Rating scale: No Recommendation / Recommended / Endorsed
- Measure position: Support / Oppose / No Position
- Studio is standalone (`studio-la-forward-voter-guide`), not embedded
  in this app
- One nested GROQ query fetches the whole guide (`sanity/lib/queries.ts`)
- Single `production` dataset — no separate testing dataset
- Time-based ISR, 5 min, no revalidation webhook to maintain
- Address lookup never stores, logs, or sends the user's address except
  the one server-side Census Geocoder call needed to match it (see
  `docs/address-matching-strategy.md`)

## Public site

Every page has the site header: LA Forward wordmark (not translated), a
language picker (Google Translate), and Donate.

| Route | What it is |
|---|---|
| `/` | Landing — see section order below |
| `/ballot` | Matched (or full) ballot after an address lookup |
| `/guide/[slug]` | One Region — statewide sections, county, or a city |
| `/outside` | Address was outside LA County; nothing about it was stored |

Landing, in order:

1. Hero
2. Key dates (cream card; Check registration / Register to vote)
3. About this guide (one accordion; no FAQ)
4. Find your ballot (address lookup)
5. Browse manually (state / county / LA City / other cities, plus Courage CA)
6. Endorsed candidates (gold border; omitted when none are published)
7. Ratings legend (full static copy)
8. Donate

Guide pages (`/guide/[slug]`) add previous/next jurisdiction links in
sidebar order (state → county → LA City → other cities). First page
shows Next only; last page shows Previous only. A Back to top link
appears under that bar when the document is taller than about 1.75
viewports. Ballot and Outside pages do not get this chrome.

Staff-editable chrome (disclaimer, county sample-ballot URL) lives in
the Studio **Site Settings** singleton, not in this repo. Election-cycle
copy — hero, key dates, about paragraphs, register/check-registration
URLs, donate ask — is in `lib/copy.ts`.

Official brand hexes live in `app/globals.css` (`#00285a`, `#003da6`,
`#0681fc`, `#ffa400`, `#ffc845`, `#ffe8b1`). Headings are Barlow
Condensed; body is Work Sans. Rating badges: thumbs up / yellow star /
check / X; No recommendation and No position are gray text with no icon.

## Content

The November 2026 skeleton is already in the `production` dataset:
statewide props and offices, State Senate/Assembly districts, LA County
measures, City of Los Angeles races and measures, other cities (mostly a
City Council race), and school boards for Palos Verdes USD and Torrance
Unified.

State/County use top-level `race` / `measure` documents that reference a
`region`. City ballots (and school boards) use a Region's or
`specialDistrict`'s `sections` array — see `docs/backend-strategy.md`
§11.

**Content status** (on races, measures, entries, and city ballot items)
is independent of Sanity's own draft documents:

- `draft` — hidden from the public guide
- `pending` — shown as "Recommendation coming soon"
- `published` — rating/position and reasoning are required and shown

New items default to `pending`. Flip to `published` in Studio when the
write-up is ready. The public site can take up to 5 minutes to catch up
(ISR). Measures without a finished write-up should stay `pending` so
they render the coming-soon row instead of an empty accordion.

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
5. Deploy this app to Vercel as a normal Next.js app. Deploy the Studio
   separately (`npx sanity deploy` from the Studio folder) — the two
   have independent deploy pipelines.

**Note on `npm run build`:** this does a real fetch to Sanity at build
time (that's what makes the homepage statically generated / ISR-cached
rather than fetched on every request). That means the build will fail if
`NEXT_PUBLIC_SANITY_PROJECT_ID` is missing or wrong — this is expected,
not a bug. It's the same reason `sanity/lib/client.ts` throws loudly on a
missing project ID instead of silently rendering an empty guide.

**CORS:** the Studio project needs this app's URL allow-listed so the
app's client can read from Sanity. Add `http://localhost:3000` (and the
production URL once deployed) from the Studio folder:
`npx sanity cors add http://localhost:3000 --credentials`, or via
[Sanity Manage](https://www.sanity.io/manage).

## Dataset: production only, no testing dataset

There is no sandbox dataset. Whatever Sea/David publish in Studio is
what the live site will show after the next ISR refresh. Use
`contentStatus: draft` to keep unfinished items off the public guide
without needing a second dataset.

## Testing

`npm test` runs the Vitest suite:

- `lib/districtMatching.test.ts` and `app/api/match-ballot/route.test.ts`
  — address matching, including at-large cities, unincorporated county,
  out-of-county rejection, and the privacy guarantee that the submitted
  address is never logged. A couple of cases hit the real files in
  `data/boundaries/*.geojson` for known addresses (not mocked), so a bad
  boundary-file edit fails a test.
- `lib/regions.test.ts` — sidebar order, LA City slug folding, and
  previous/next jurisdiction helpers (`navSequence`, `adjacentRegions`).
- `lib/endorsed.test.ts` — landing Endorsed section: published only,
  city ballot races, sidebar order, empty when none.
- `lib/contentLength.test.ts` — when Back to top should appear.
- `lib/labels.test.ts`, `lib/contentStatus.test.ts`,
  `lib/raceLabel.test.ts`, `lib/geoapifyAddress.test.ts`,
  `lib/guidePayload.test.ts`, `lib/siteSettings.test.ts` — rating copy
  and icons, pending/published display, address widget wrapper, payload
  defaults, and Site Settings fallbacks.

There is no mocked Sanity client. Tests cover app logic, not CMS content.

## Still deferred

- `sanity typegen` for auto-generated query types — `lib/types.ts` is
  kept in sync with `GUIDE_QUERY` by hand. Worth adding once the schema
  is done shifting.
- Endorsement write-ups — the skeleton is in Studio; ratings, reasoning,
  and candidate photos still get filled in there as research lands.
