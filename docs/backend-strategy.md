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
| 5 | Address-based ballot filter backend (PRD §6) | Decided, in scope for Oct 1 launch — see §12 and `docs/address-matching-strategy.md` |

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
`production` project and dataset. The hosted Studio is
`https://la-forward-voter-guide.sanity.studio`. §1–§9 above otherwise still stand.

## 11. City ballot content model: raceGroup / measureGroup / specialDistrict

**Context:** City ballots vary too widely for the flat Region → Race/Measure
document model (Torrance might have 2 items, Glendale 7), and some
districts (school boards, community college boards — e.g. LACCD serves 36
cities, LAUSD 25+) serve many cities at once, so they can't reference a
single owning Region the way Race/Measure do today.

**Decision — hybrid model:**
- City-tier `Region` documents get a new `sections` field: an ordered,
  editor-controlled array of `raceGroup`/`measureGroup` blocks. Race and
  measure content inside these blocks are lightweight **embedded objects**
  (`ballotRace`/`ballotMeasure`), not separate documents — ownership is by
  containment, not by reference.
- `Entry` (candidate) stays a top-level document — its own edit view,
  photo field, rating, and the Studio "All Entries" list are unchanged.
  What flips: instead of `entry.race` pointing at a race document,
  `ballotRace.entries` is an array of references *to* `entry` documents.
  `entry.race` becomes optional as a result — set it for state/county
  entries (unchanged), leave it blank for city-ballot entries (which are
  discovered via containment instead).
- New `specialDistrict` document type: its own `sections` (same
  `raceGroup`/`measureGroup` shape as a city) plus `citiesServed`, a
  multi-reference to every City-tier Region it applies to. A city's page
  renders its own `sections` plus every `specialDistrict` that lists it,
  combined into one list — city's own content first, special districts
  appended in alphabetical title order (see the GROQ pattern below).
- State/County Regions and the existing top-level `race`/`measure`
  documents/queries are unchanged — this model only applies where a city
  ballot (or a district spanning multiple cities) needs it.

**Known gap, not solved this pass:** special-district coverage that
extends into unincorporated LA County (e.g. LAUSD) has no Region document
to link for those areas, since unincorporated areas aren't modeled as
Regions. Noted in `specialDistrict.ts` schema comments.

**Naming:** the embedded race/measure objects are named `ballotRace` /
`ballotMeasure`, not `race`/`measure` — those names are already taken by
the state/county document types, and reusing them would collide.

**Order fields:** confirmed Sanity Studio's array editor natively
drag-reorders any array (object arrays and reference arrays alike), and
GROQ returns array items in their stored order — so `sections`,
`raceGroup.races`, and `measureGroup.measures` deliberately have no
explicit numeric `order` field. The existing `order` fields on
`region`/`race`/`measure`/`entry` are unaffected — they solve a different
problem (sorting *independent top-level documents* returned by a filter,
which has no inherent order), not duplicated by this.

**Confirmed GROQ merge pattern** for a city page (own sections first, then
special districts in title order, using GROQ's `+` array-concatenation
operator and its flat-map behavior on `arrayOfDocs.sections[]`):

```groq
*[_type == "region" && tier == "city"] | order(order) {
  title, slug, tier, description,
  "sections":
    sections[]{
      _key, _type, label,
      _type == "raceGroup" => {
        races[]{
          _key, title, "slug": slug.current, office, context,
          "entries": entries[]->{_id, name, "slug": slug.current, photo, rating, reasoning}
        }
      },
      _type == "measureGroup" => {
        measures[]{_key, title, "slug": slug.current, summary, position, pros, cons}
      }
    }
    +
    (*[_type == "specialDistrict" && references(^._id)] | order(title asc)).sections[]{
      _key, _type, label,
      _type == "raceGroup" => {
        races[]{
          _key, title, "slug": slug.current, office, context,
          "entries": entries[]->{_id, name, "slug": slug.current, photo, rating, reasoning}
        }
      },
      _type == "measureGroup" => {
        measures[]{_key, title, "slug": slug.current, summary, position, pros, cons}
      }
    }
}
```

**Also confirmed in this pass:**
- Entry rating scale stays at 3 values (No Recommendation / Recommended /
  Endorsed) — "Harm Reduction" was considered and explicitly re-rejected,
  matching §1.
- `measure.recommendation` renamed to `measure.position` (zero-cost, no
  content exists yet) to match the term already locked in §1 and
  `.cursor/rules/project-overview.mdc`; both `position` and `pros`/`cons`
  are now required — not either/or.

Frontend follow-up (not part of this schema-only pass): `voter-guide-app`'s
`lib/types.ts`, `sanity/lib/queries.ts`, and rendering components need
matching updates once this schema is deployed.

September 2026 update: measure `pros` and `cons` were replaced by one
`reasoning` write-up (normal paragraphs only). The GROQ sample above is
the shape from this pass; the live query is `sanity/lib/queries.ts`.

## 12. Address-based ballot matching — how it was built

Implements the decision doc at `docs/address-matching-strategy.md`. This
section is the "as-built" architecture reference; the doc above stays the
record of *why*.

**District code field.** `race.district` / `ballotRace.district` — optional
string, e.g. `"CD4"`, `"SD24"`, `"CC4"`. Blank means at-large/citywide, and
such races always render once their Region is in view, regardless of match
precision. Convention:

- `CD<n>` Congressional, `SD<n>` State Senate, `AD<n>` State Assembly,
  `SUP<n>` county supervisorial, `CC<n>` city council (no city prefix — the
  race already lives inside that city's Region). `SB<n>` (school board
  sub-district) and `TA<n>` (community college trustee area) are reserved
  for future use once that boundary data is sourced — see below.
- Measures have no `district` field — they were out of scope for this
  phase (ballot measures in this guide are city-wide or state-wide, not
  sub-districted).

**Census layer verification.** Confirmed by direct API call (2026-08-12)
that Census's `Unified School Districts` layer resolves LAUSD as a whole
(`GEOID 0622710`, `Los Angeles Unified School District`) for an in-district
address. That's useful for confirming *membership* in LAUSD, but Census
has no layer for the 7 internal board sub-districts, so it doesn't unlock
`SB<n>` matching by itself — sub-district boundaries would still need
separate sourcing (e.g. from LAUSD directly). Community college trustee
areas (`TA<n>`, e.g. LACCD) aren't a Census geography at all. Both remain
open items — races using those prefixes render unfiltered (see below)
until that data exists.

**Boundary data sourced** (`voter-guide-app/data/boundaries/`, server-only,
not under `public/`): LA County supervisorial districts (5, county-wide,
redraws once per decade) and city council districts for 9 cities — Los
Angeles (15), Pasadena (7), Torrance (6), Pomona (6), Monterey Park (5),
Covina (5), Lakewood (5), Carson (4), and Inglewood (4) — each simplified
or field-filtered from ArcGIS REST GeoJSON exports via `mapshaper`. See
that folder's README for exact sources and the "add another city" recipe.
Congressional/State Senate/State Assembly/city-name/county boundaries need
no local file — Census's `geographies` endpoint returns them in the same
call used to get coordinates.

**Per-city boundary survey (2026-08-13).** Of the ~20 non-LA cities this
guide covers, most turned out to need no boundary file at all: their
council seats are elected at-large, so there's no sub-district race to
filter — San Marino, Sierra Madre, La Cañada Flintridge, La Puente, Bell,
Bell Gardens, Commerce, Lawndale, Gardena, Glendale (a 2023-24 districting
process was studied but never adopted — June 2026 election was still 3
at-large seats), and all four Palos Verdes Peninsula cities (Palos Verdes
Estates, Rancho Palos Verdes, Rolling Hills, Rolling Hills Estates). Eight
more are by-district and now have a sourced boundary file (see above) —
six of them (Carson, Inglewood, Monterey Park, Pasadena, Pomona, Torrance)
came from a single authoritative source: LA County RRCC's own
`Precinct_Maps` ArcGIS service (`INCORPORATED_CITIES1` layer), which the
Registrar-Recorder maintains to build actual ballots — about as
authoritative as boundary data gets. One remaining city, Lomita
(by-district since the 2024 election, 5 districts), has no machine-readable
source — only a static map image on the city's site — and stays on the
graceful "full unfiltered ballot" fallback. Compton Unified School
District's 7 trustee areas are the same story: a PDF map exists, but no
GIS layer, so it degrades the same way as LAUSD's board sub-districts.

**API route** — `app/api/match-ballot/route.ts`, the one deliberate
exception to this app's fully-static/ISR model (Census has no CORS
support, so geocoding can't happen in the browser). `POST {address}` →

```ts
{precision: 'precise' | 'city' | 'none', citySlug: string | null, districtCodes: string[]}
```

- `'none'` — geocode failed, or outside LA County.
- `'city'` — matched a city (`citySlug` set), but its council district
  didn't resolve to a code — either the boundary isn't sourced yet, *or*
  it is sourced but this point didn't land inside any of its polygons (a
  data gap/edge case); `districtCodes` still carries whichever
  CD/SD/AD/SUP codes did resolve.
- `'precise'` — either unincorporated LA County (`citySlug: null`, nothing
  further to resolve) or a city whose council boundary *did* resolve a
  code for this address.

Census's layer names change on a schedule outside our control (e.g. the
"119th Congressional Districts" layer becomes "120th" after the next
election). The route matches layer keys by substring (`findLayerValue`),
not exact string, so it keeps working across those renames without a code
change. Each local boundary-file lookup (`matchDistrictCode`) also catches
its own errors — a missing/malformed file for one layer (e.g. a typo'd
filename when a future maintainer adds a city) degrades just that layer
to "unresolved" rather than discarding every code already resolved before
it ran.

**Filtering logic** (`lib/districtMatching.ts`) — applied client-side to
the already-fetched `GuideRegion[]`, not a second Sanity query:

- `coverablePrefixesFor(result)` — which prefixes this specific match can
  be trusted to filter by, derived directly from the prefixes actually
  present in `result.districtCodes` (not from `precision` or which files
  exist) — so a sourced-but-not-actually-resolved layer (see `'city'`
  above) is treated the same as an unsourced one: unverifiable, never
  used to hide a race.
- `passesDistrictFilter(district, result)` — a race with no district
  always passes; one whose code is in `result.districtCodes` passes; one
  whose *prefix* isn't coverable (school sub-district, trustee area, most
  cities' council districts, or a layer that failed to resolve for this
  address) also passes — never hide a race on a layer we can't actually
  verify. Only a coverable-but-non-matching code hides the race.
- `filterRegionsByMatch(regions, result)` — drops City-tier Regions that
  aren't the matched city (a voter's ballot never includes another city's
  races); keeps State/County Regions always, trimming their races by the
  above.

**Frontend** — `components/AddressLookup.tsx` wraps Geoapify's vanilla-JS
widget (`@geoapify/geocoder-autocomplete`, no official React binding) in a
plain container div; the browser talks to Geoapify directly with a
publishable, referrer-restricted key (`NEXT_PUBLIC_GEOAPIFY_API_KEY`) and
never touches our server until a suggestion is picked. If the key is
missing, it renders a "not configured" message instead of throwing — the
rest of the guide is unaffected. `components/GuideBody.tsx` (client
component, rendered from the server-rendered `page.tsx`) owns the match
state, the `POST /api/match-ballot` call, the filtered/unfiltered toggle,
and the degradation messaging.

**What's left, on purpose** (matches the decision doc's own open items,
now narrowed by the survey above): LAUSD board sub-district and LACCD
trustee-area boundaries, Compton Unified's 7 trustee areas, and Lomita's
5 council districts — all four have no GIS source found yet, so they stay
on the graceful unfiltered fallback until someone sources a file for them
(same "drop a GeoJSON, add one map entry" recipe as every other city). A
real, referrer-restricted Geoapify key is configured
(`NEXT_PUBLIC_GEOAPIFY_API_KEY` in `.env.local`); nothing further is
needed to bring this feature live.
