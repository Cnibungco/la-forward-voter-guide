# Voter Guide — Backend Strategy

**Status:** Proposed — for Camille review before Cursor build starts
**Context:** PRD §5 locked Sanity (headless CMS) + Next.js. This doc covers
everything *below* that decision — the parts the PRD doesn't specify.

---

## 1. Locked as of this conversation

| Item | Decision |
|---|---|
| Entry rating scale | No Recommendation / Recommended / Endorsed — Harm Reduction dropped |
| Measure position | Support / Oppose / No Position |
| Content model | Region → Race/Measure → Entry (schema already built, typechecked) |

Not yet applied to the schema files — holding until this strategy is settled, per your ask. One-line changes in `entry.ts` and `measure.ts` when we resume.

---

## 2. ADR: Standalone Studio vs. embedded Studio

**Context:** Sanity Studio can either live as its own deployed app
(`sanity deploy` → `project-name.sanity.studio`) or be embedded as a route
inside the Next.js app itself (e.g. `yourdomain.org/studio`), via
`next-sanity`'s Studio component.

### Option A: Standalone Studio (separate deploy)

| Dimension | Assessment |
|---|---|
| Repos/deploys | 2 (studio repo → Sanity hosting, web repo → Vercel) |
| Cursor workflow | Two projects open, two `npm run dev` processes |
| Editor URL | `la-forward.sanity.studio` (separate from the live site) |
| Blast radius | Studio bugs can't break the public site build |
| Long-term maintenance | Two things to remember exist, two places to update dependencies |

### Option B: Embedded Studio (single Next.js app)

| Dimension | Assessment |
|---|---|
| Repos/deploys | 1 (single Vercel deploy) |
| Cursor workflow | One project, one `npm run dev`, studio at `/studio` |
| Editor URL | `voterguide.laforward.org/studio` — same domain as the live site |
| Blast radius | A studio dependency bump could theoretically affect the site build |
| Long-term maintenance | One repo for David/Sea's future maintainer to find, one deploy pipeline |

**Recommendation: B, embedded.** The deciding factor is the same one from
PRD §5 — this has to survive without you or Viv. A future maintainer
finding *one* repo with a README is a materially lower bar than finding
two repos and understanding how they relate. The downside (shared build)
is low-risk for a low-traffic civic site with no real scaling concerns.
Flagging as a real recommendation, not a formality — say so if the
two-repo separation matters more to you than I'm weighing it.

---

## 3. ADR: Data fetching — one nested query vs. many

**Context:** The frontend needs to render the full guide (all regions,
races, measures, entries) collapsed by default, expandable on click.

### Option A: Many small GROQ queries (one per Region/Race as needed)

Pros: smaller payloads, more "correct" REST-like shape
Cons: N+1 pattern, more caching surface area, more code to maintain

### Option B: One nested GROQ query, fetched once per page load

```groq
*[_type == "region"] | order(tier, order) {
  title, slug, tier, description,
  "races": *[_type == "race" && references(^._id)] | order(order) {
    title, slug, office, context,
    "entries": *[_type == "entry" && references(^._id)] | order(order) {
      name, slug, photo, rating, reasoning
    }
  },
  "measures": *[_type == "measure" && references(^._id)] | order(order) {
    title, slug, summary, pros, cons, recommendation
  }
}
```

Pros: one round trip, simpler caching (one cache key for the whole
guide), matches how the content actually gets consumed (users load the
whole guide, not one race at a time)
Cons: any single edit invalidates the whole cached page — acceptable
here since this isn't live-ticking data; Sea/David publish, not thousands
of concurrent writers

**Recommendation: B.** Total content is ~40K words — small enough that
"fetch everything, cache it, invalidate on publish" is simpler than
building pagination or per-section fetching you don't need.

---

## 4. Dataset strategy

Sanity's free tier supports multiple datasets per project. Two options:

- **Single `production` dataset** — simplest, matches "no review workflow" (PRD §4)
- **`testing` + `production`** — lets Sea/David do the 15-minute test and initial content entry without risk to anything, promote/re-enter into `production` once confirmed

**Recommendation: `testing` now, `production` created once the 15-minute
test passes.** Costs nothing extra and means an early mistake during the
test doesn't touch anything that matters. Worth your call, not a strong
opinion either way.

---

## 5. Cache invalidation (ISR)

Two ways for the Next.js frontend to notice new/edited content:

- **Time-based revalidation** (e.g. `revalidate: 300`) — dumb, simple, no moving parts to break
- **Webhook-based** (Sanity fires a webhook on publish → Next.js API route calls `revalidatePath`) — instant updates, but one more integration that can silently stop working with nobody watching it

**Recommendation: time-based, 5–10 min window.** Instant publish isn't a
real requirement here — a few minutes' lag between Sea publishing and it
appearing live is fine for a voter guide. Fewer moving parts survives
volunteer/pro-bono maintenance better than "instant but fragile."

---

## 6. Proposed repo structure (for Cursor)

Reflects the embedded-Studio recommendation from §2:

```
la-forward-voter-guide/
├── app/
│   ├── (site)/                 # public frontend routes
│   └── studio/[[...tool]]/     # embedded Sanity Studio
├── sanity/
│   ├── schemaTypes/            # region.ts, race.ts, measure.ts, entry.ts (already built)
│   ├── structure.ts            # already built
│   ├── lib/
│   │   ├── client.ts           # Sanity client (projectId, dataset, apiVersion)
│   │   └── queries.ts          # the nested GROQ query from §3
│   └── sanity.config.ts
├── components/
├── lib/
├── public/
├── .env.example
├── next.config.ts
└── package.json
```

If you'd rather keep Studio standalone (Option A above), this becomes a
two-folder monorepo (`/studio`, `/web`) instead — flag it and I'll redraw
this.

---

## 7. Phased backend build plan

| Phase | Scope | Status |
|---|---|---|
| 1 | Schema types (Region/Race/Measure/Entry) | Done, typechecked |
| 2 | Sanity client + GROQ query layer, `sanity typegen` for TS types from schema | Not started |
| 3 | Seed script with placeholder content for local dev / the 15-min test | Not started |
| 4 | Embed Studio in Next.js app, wire up `/studio` route | Not started |
| 5 | Address-based ballot filter backend (PRD §6) | Deliberately separate, later, Preferred not Required |

---

## 8. Decisions — confirmed

1. **Embedded Studio** — confirmed, so the editor lives on your own domain
2. **One nested query** — confirmed
3. **Single `production` dataset, no testing dataset** — confirmed,
   overriding my earlier recommendation. Real cost: Sea/David's first
   hands-on Studio session creates content directly in the live dataset.
   See handoff README for how to handle that.
4. **Time-based revalidation, 5 min** — confirmed

Explicit optimization target going forward, per Camille: **longevity and
low maintenance burden over short-term convenience.** This should keep
shaping Phase 2+ calls (typegen timing, whether to add a webhook later,
etc.), not just the four above.

## 9. Phase 2 build notes (completed, handed off for Cursor)

- Schema updated: rating scale is No Recommendation / Recommended /
  Endorsed; measure recommendation is Support / Oppose / No Position —
  both confirmed, no longer flagged as pending.
- Sanity client (`sanity/lib/client.ts`) and the nested GROQ query
  (`sanity/lib/queries.ts`) are built and typechecked.
- Studio embedded at `/studio` inside the Next.js app, per §2/§6's
  structure. This hit a real upstream bug —
  [next-sanity#2201](https://github.com/sanity-io/next-sanity/issues/2201):
  embedding Studio in a Next.js 15 App Router project throws
  `createContext is not a function` at build time unless
  `sanity.config.ts` is explicitly marked `'use client'`. Fixed in the
  handoff; documented in the app's README so it doesn't get silently
  reintroduced by a future dependency bump or refactor.
- Full `next build` validated end-to-end (not just `tsc --noEmit`) — the
  only remaining failure in this sandbox is the fake placeholder project
  ID, which resolves once a real Sanity project is connected in Cursor.

## 10. Amendment: Studio de-embedded (standalone)

**Superseding §2/§6/§8.1.** The embedded-Studio recommendation was
reversed by explicit user request. The Studio now lives standalone in
`studio-la-forward-voter-guide`, a sibling folder next to this app, not
as a `/studio` route in this repo.

What changed in this app:
- Removed: `sanity.config.ts`, `structure.ts`, `schemaTypes/`,
  `app/studio/[[...tool]]/`, and the `sanity`/`@sanity/vision`/
  `styled-components` dependencies (Studio-only).
- Kept unchanged: `sanity/lib/client.ts`, `sanity/lib/queries.ts`
  (`GUIDE_QUERY`), the 5-minute time-based ISR, and the single
  `production` dataset — none of those decisions changed, only where
  the Studio itself runs.
- `lib/types.ts` no longer imports the `Image`/`PortableTextBlock` types
  from the `sanity` package (this app doesn't depend on it anymore); it
  uses a local `SanityImageValue` type and `@portabletext/types`.

The schema (Region/Race/Measure/Entry) and desk `structure.ts` now live
in `studio-la-forward-voter-guide`, pointed at the same `wcogcahu` /
`production` project and dataset. §1–§9 above otherwise still stand.
