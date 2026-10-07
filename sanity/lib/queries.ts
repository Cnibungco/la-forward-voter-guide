import {defineQuery} from 'next-sanity'

const notDraft = `contentStatus != "draft"`

/**
 * Shared projection for a `raceGroup`/`measureGroup` block. Used twice
 * below: once for a Region's own `sections`, once for every
 * `specialDistrict` that references that Region — see the merge pattern
 * in docs/backend-strategy.md §11.
 *
 * `contentStatus == "draft"` items are dropped here so they never reach
 * the public guide. Pending items are included and rendered as
 * "Write-up coming soon".
 */
const sectionFields = `
  _key,
  _type,
  label,
  _type == "raceGroup" => {
    "races": coalesce(races, [])[${notDraft}]{
      _key,
      title,
      "slug": slug.current,
      office,
      district,
      context,
      contentStatus,
      "entries": coalesce(entries, [])[defined(@->_id) && @->contentStatus != "draft"]->{
        _id,
        name,
        "slug": slug.current,
        photo,
        rating,
        reasoning,
        contentStatus,
      }
    }
  },
  _type == "measureGroup" => {
    "measures": coalesce(measures, [])[${notDraft}]{
      _key,
      title,
      "slug": slug.current,
      summary,
      position,
      reasoning,
      contentStatus,
    }
  }
`

/**
 * The whole guide, plus site-wide settings, in one request. Deliberately
 * not split into per-region/per-race queries — see backend strategy doc
 * §3. The settings singleton is the same HTTP round-trip, not a second
 * Sanity query.
 *
 * `races`/`measures` are the State/County path (separate documents
 * referencing this Region). `sections` is the City path — a Region's own
 * ordered raceGroup/measureGroup blocks, concatenated with every
 * specialDistrict's blocks that lists this Region in `citiesServed` (own
 * content first, districts in title order). See §11.
 *
 * The district half cannot be `(*[...]).sections[]`. That attribute
 * access is null even when a district exists, and GROQ's `array + null`
 * is null — `coalesce` then turns the whole merge into `[]`, so a city
 * with its own ballot renders as "Nothing entered." Map the district
 * sections, flatten, and coalesce that half to `[]`.
 */
export const GUIDE_QUERY = defineQuery(`{
  "regions": *[_type == "region"] | order(tier asc, order asc) {
    _id,
    title,
    "slug": slug.current,
    tier,
    order,
    description,
    "races": *[_type == "race" && references(^._id) && ${notDraft}] | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      office,
      district,
      context,
      contentStatus,
      "entries": *[_type == "entry" && references(^._id) && ${notDraft}] | order(order asc) {
        _id,
        name,
        "slug": slug.current,
        photo,
        rating,
        reasoning,
        contentStatus,
      }
    },
    "measures": *[_type == "measure" && references(^._id) && ${notDraft}] | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      reasoning,
      position,
      contentStatus,
    },
    "sections":
      coalesce(sections, [])[]{${sectionFields}}
      + coalesce(
          *[_type == "specialDistrict" && references(^._id)] | order(title asc) {
            "sections": sections[]{${sectionFields}}
          }.sections[],
          []
        )
  },
  "settings": *[_id == "siteSettings"][0]{
    disclaimer,
    sampleBallotUrl
  }
}`)
