# Address-based ballot matching

Status: decided, in scope for Oct 1 launch
Date: 2026-08-12

## Context

Ballots are not determined by any single boundary. Election officials geocode a
voter's address to a point, then test that point against every independently drawn
boundary layer that covers it — congressional, state senate, state assembly, county
supervisorial, city limit, school district, community college district. The unique
combination of layers containing that point defines the ballot ("ballot type").

None of these layers are drawn to align with each other. Zip codes align with none
of them — they are USPS mail-routing shapes, not legal boundaries, and a single zip
can span multiple cities and multiple school districts.

Zip-based matching was considered and rejected. It fails in a specific way that
matters here: it can confidently display the wrong down-ballot races (school board,
judicial, council) with no signal to the voter that anything is off. Since LA
Forward's differentiator is coverage of exactly those down-ballot races, a
confidently-wrong match is worse than no match.

Device geolocation was also considered and rejected. It reports where a device is
now, not where the user is registered to vote — someone reading the guide at work
would be matched to the wrong ballot entirely. It is also a heavier trust ask
(browser permission prompt) than a field the user chooses to type into.

## Decision

Address entry, geocoded, matched against boundary layers.

### Geocoder: US Census Geocoder

Chosen over the Google Geocoding API:

- Free, no billing account required. Relevant for an org funded primarily by
  small-dollar donations.
- Returns congressional and state legislative geography as part of the same
  lookup that returns coordinates — this layer requires no separate boundary
  sourcing.

### Input: address autocomplete, not raw text

A free-text field invites typos that fail geocoding silently. Autocomplete
constrains input to resolvable addresses at type-time and materially reduces
failed lookups.

### Privacy: address is not persisted

The address is used once to compute the district match and then discarded. It is
not written to a database, analytics event, or log.

This includes error and observability tooling. A failed-lookup handler is the most
likely place a raw address gets logged accidentally for debugging — it must not.

The UI states this to the user. The implementation must make the claim true.

### Schema: structured district identifiers on race entries

Race entries currently carry district only as display text ("District 1 — Eunisses
Hernandez"). Address matching requires a separate machine-matchable field, e.g.
`district: "CD4"`, `"SD24"`.

This must land before content entry begins in September. Retrofitting it means
re-touching every entry already written.

### Graceful degradation: match to the coarsest available tier

Boundary data availability is uneven across the ~21 covered cities. Rather than
block the feature on complete coverage:

- District-level boundaries available → match to the specific race entry
- Not available → match to the city as a whole, same result as browsing manually
- Address outside LA County → inline error, full browsable guide shown
- Address fails to geocode → inline error, full browsable guide shown

The user is never left at a dead end. Worst case is the guide they would have
gotten by browsing.

## Boundary layer sourcing

| Layer | Source | Confidence |
| --- | --- | --- |
| Congressional, state senate, state assembly | Census Geocoder (same call) | High |
| County supervisorial | LA County GIS portal | High |
| School / community college districts | Census district boundaries | Medium — verify LAUSD and LACCD specifically |
| City council districts — LA City | LA City open data portal | Medium |
| City council districts — other ~20 cities | Per-city, varies | Low — unverified, expect gaps |

Per-city boundary availability is the largest unknown-effort item in this feature
and has not been surveyed. The degradation tier above exists so that gaps here
delay precision, not launch.

## Open items

- Per-city boundary data survey — which of the ~20 non-LA cities publish
  machine-readable council district boundaries
- Whether "address not found" and "address outside coverage area" get distinct
  user-facing messages (behavior is identical; wording may not be)
- District identifier format convention (`"CD4"` vs `"cd-4"` vs structured object)
  before content entry begins

## Implementation notes (added during planning/build — 2026-08-12/13)

See [docs/backend-strategy.md](./backend-strategy.md) §12 for how this was actually
built: the `district` field convention adopted, the Geoapify/Census split, the
`/api/match-ballot` contract, and what shipped.

The per-city boundary survey (line 97 above) is done as of 2026-08-13 — see
§12 and `data/boundaries/README.md` for the full results. Short version: most
of the ~20 cities turned out to be at-large (no district race to filter at
all, so no boundary needed), 8 are by-district and now have a sourced
boundary file, and only Lomita (plus Compton USD's school-board trustee
areas) remain a real gap with no machine-readable source found. The Geoapify
API key is configured, referrer-restricted, and live — nothing about this
feature is still blocked.
