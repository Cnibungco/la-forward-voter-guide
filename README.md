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

| Route | What it is |
|---|---|
| `/` | Landing: address lookup, browse-by-jurisdiction cards, ratings legend |
| `/ballot` | Matched (or full) ballot after an address lookup |
| `/guide/[slug]` | One Region — statewide sections, county, or a city |
| `/outside` | Address was outside LA County; nothing about it was stored |

Staff-editable chrome (disclaimer, county sample-ballot URL) lives in
the Studio **Site Settings** singleton, not in this repo. Election-cycle
copy such as the hero kicker is in `lib/copy.ts`.

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
(ISR).

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
- `lib/regions.test.ts`, `lib/labels.test.ts`, `lib/contentStatus.test.ts`,
  `lib/raceLabel.test.ts`, `lib/geoapifyAddress.test.ts` — nav order,
  rating copy, pending/published display, and the address widget wrapper.

There is no mocked Sanity client. Tests cover app logic, not CMS content.

## Still deferred

- `sanity typegen` for auto-generated query types — `lib/types.ts` is
  kept in sync with `GUIDE_QUERY` by hand. Worth adding once the schema
  is done shifting.
- Endorsement write-ups — the skeleton is in Studio; ratings, reasoning,
  and candidate photos still get filled in there as research lands.
