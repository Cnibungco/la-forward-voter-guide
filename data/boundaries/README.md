# Boundary data

GeoJSON polygons used by `app/api/match-ballot/route.ts` for point-in-polygon
matching. Not served to the browser — read server-side only. See
`docs/address-matching-strategy.md` for why these exist and
`docs/backend-strategy.md` §12 for the matching architecture.

Congressional, State Senate, State Assembly, city (Incorporated Place), and
LAUSD boundaries are **not** here — the Census Geocoder returns those directly
in the same call used to get coordinates, so no local file is needed for them.

## Files

| File | Source | Districts | Downloaded |
| --- | --- | --- | --- |
| `county-supervisorial-districts.geojson` | [LA County GIS — Supervisorial District (Current)](https://public.gis.lacounty.gov/arcgis/rest/services/LACounty_Dynamic/Political_Boundaries/MapServer/27) | 5 (county-wide) | 2026-08-12 |
| `la-city-council-districts.geojson` | [LA City GeoHub — Council Districts](https://maps.lacity.org/lahub/rest/services/Boundaries/MapServer/13) | 15 (LA City only) | 2026-08-12 |
| `carson-council-districts.geojson` | [LA County RRCC — Precinct_Maps, `INCORPORATED_CITIES1`](https://arcgis.gis.lacounty.gov/arcgis/rest/services/RRCC/Precinct_Maps/MapServer/19) | 4 | 2026-08-13 |
| `inglewood-council-districts.geojson` | same RRCC layer as above | 4 | 2026-08-13 |
| `monterey-park-council-districts.geojson` | same RRCC layer as above | 5 | 2026-08-13 |
| `pasadena-council-districts.geojson` | same RRCC layer as above | 7 | 2026-08-13 |
| `pomona-council-districts.geojson` | same RRCC layer as above | 6 | 2026-08-13 |
| `torrance-council-districts.geojson` | same RRCC layer as above | 6 | 2026-08-13 |
| `lakewood-council-districts.geojson` | [City of Lakewood, CA GIS — Council District Boundaries](https://services5.arcgis.com/bkaqPVf76HqGHC0b/arcgis/rest/services/Lakewood_City_Council_Districts/FeatureServer/0) | 5 | 2026-08-13 |
| `covina-council-districts.geojson` | [City of Covina districting site — Covina_Voting_Districts_WFL1](https://services2.arcgis.com/nzGFbmT76gMzTNvU/arcgis/rest/services/Covina_Voting_Districts_WFL1/FeatureServer/0) | 5 | 2026-08-13 |

The RRCC `INCORPORATED_CITIES1` layer is worth noting specially: it's
maintained by the county Registrar-Recorder/County Clerk to build actual
ballots, keyed by a `LABEL` like `"CITY OF CARSON 1ST COUNCIL"` and a
numeric `DIV_CITY` field. It was queried once for all six cities' features
at once, then split into one file per city with a Python script (not
checked in — one-off), matching the "one file per city" pattern below.

All files were re-projected to WGS84 (`outSR=4326`) at download time, so
they use plain lat/lng and work directly with
`@turf/boolean-point-in-polygon`. The two county/LA-City files (the large
ones — original ArcGIS exports were ~7.4MB combined) were simplified with
`mapshaper` (Douglas-Peucker, 8%) and stripped to only the field the
matching route reads. The eight per-city files added 2026-08-13 are all
small enough (a few KB to ~110KB raw) that simplification wasn't worth the
self-intersection risk it introduced at 8% — they're only field-filtered
and precision-quantized:

```bash
# Large county/city-wide layers (worth simplifying):
npx mapshaper <raw-file>.geojson -filter-fields <FIELD> -simplify dp 8% keep-shapes -o format=geojson precision=0.00001 <output>.geojson

# Small single-city layers (skip -simplify, just clean fields + precision):
npx mapshaper <raw-file>.geojson -filter-fields <FIELD> -o format=geojson precision=0.00001 <output>.geojson
```

## Per-city boundary survey (2026-08-13)

Covers the ~20 cities outside LA City that this guide's spring coverage
included, plus Compton Unified School District. Two categories turned out
to need nothing at all:

- **At-large, no gap** — no sub-district council race exists, so nothing
  to filter: San Marino, Sierra Madre, La Cañada Flintridge, La Puente,
  Bell, Bell Gardens, Commerce, Lawndale, Gardena, Glendale (a 2023-24
  districting process reached draft maps but was never adopted — the city
  still elected 3 at-large seats in June 2026), Palos Verdes Estates,
  Rancho Palos Verdes, Rolling Hills, and Rolling Hills Estates.
- **By-district, now sourced** — the 8 files listed in the table above.

## Coverage gaps (expected — see decision doc)

- **County supervisorial districts change only once per decade** (next
  redistricting: 2031, after the 2030 Census) — this file does not need
  routine refreshing.
- **LA City and the 8 other by-district cities'** council maps also
  redraw only after redistricting (each roughly once per decade) — same
  low-maintenance profile.
- **Lomita** (by-district since the 2024 election, 5 districts) has no
  machine-readable boundary source — only a static map image on the
  city's site. Addresses there match at the city level only, until
  someone finds or digitizes a usable source.
- **LACCD community college trustee areas** are not a Census geography and
  have no file here yet — same "city-level fallback, no district precision"
  degradation applies.
- **LAUSD school board sub-districts**: Census's `Unified School Districts`
  layer confirms an address is inside LAUSD as a whole (verified 2026-08-12),
  but doesn't break it down by the 7 board sub-districts — a future file
  here, keyed the same way, would add that precision.
- **Compton Unified School District's 7 trustee areas**: same story as
  LAUSD — a static PDF map exists (from the county RRCC GIS section) but
  no GIS layer was found.

Adding a new city: drop a `<city-slug>-council-districts.geojson` file here
(same WGS84 pattern; simplify only if the raw file is large) and add one
entry to the `CITY_COUNCIL_LAYERS` map in `app/api/match-ballot/route.ts` —
no other code changes needed.

**Watch for same-named cities in other states.** During the 2026-08-13
survey, an early pull of "Lakewood" boundaries from `egis.lakewood.org`
turned out to be Lakewood, *Colorado* (same domain pattern, unrelated
city) — caught by checking the downloaded coordinates against LA County's
extent (roughly -119° to -117.6° lon, 33.3° to 34.8° lat) before wiring it
in. "Pasadena" has the same trap (there's a Pasadena, TX with near-identical
GIS URLs). Always sanity-check a new file's coordinates land in LA County
before adding it to `CITY_COUNCIL_LAYERS` — a wrong-city file would fail
silently (no match found) rather than erroring, which is worse than not
sourcing the city at all.
