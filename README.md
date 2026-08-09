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
- Single `production` dataset — no separate testing dataset (see below)
- Time-based ISR, 5 min, no revalidation webhook to maintain

## Setup

This app expects `studio-la-forward-voter-guide` to exist as a sibling
folder (same parent directory as this repo) and to already be pointed
at a real Sanity project.

1. `cp .env.example .env.local` and fill in the real project ID (see
   the Studio's `sanity.config.ts` / `sanity.cli.ts` for the project ID
   and dataset — currently `wcogcahu` / `production`).
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

Per your call — optimizes for one less thing to explain to a future
maintainer. The real cost: when Sea/David do their first hands-on test in
Studio, whatever they create is live in the actual dataset, not a
disposable sandbox. Two ways to handle it, your choice which:

- Have them prefix test entries with something obvious ("TEST — delete
  me") and delete before real content entry starts, or
- Treat their first session as real content entry from the start (a
  region/race they'd need eventually anyway), so nothing needs deleting

## What's not built yet

- Content — the Studio's schema is deployed but no Region/Race/Measure/
  Entry documents exist yet. The homepage renders an empty-state message
  until Sea/David add content in Studio.
- Address-based ballot filter (PRD §6) — separate backend, Preferred not
  Required, intentionally not part of this.
- `sanity typegen` for auto-generated query types — worth adding once the
  schema stabilizes past this initial pass; skipped for now since the
  schema is still likely to shift once Sea/David's test surfaces issues.
