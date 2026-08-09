import {defineQuery} from 'next-sanity'

/**
 * Shared projection for a `raceGroup`/`measureGroup` block. Used twice
 * below: once for a Region's own `sections`, once for every
 * `specialDistrict` that references that Region — see the merge pattern
 * in docs/backend-strategy.md §11.
 */
const sectionFields = `
  _key,
  _type,
  label,
  _type == "raceGroup" => {
    "races": races[]{
      _key,
      title,
      "slug": slug.current,
      office,
      context,
      "entries": entries[]->{
        _id,
        name,
        "slug": slug.current,
        photo,
        rating,
        reasoning,
      }
    }
  },
  _type == "measureGroup" => {
    "measures": measures[]{
      _key,
      title,
      "slug": slug.current,
      summary,
      position,
      pros,
      cons,
    }
  }
`

/**
 * The whole guide, in one request. Deliberately not split into
 * per-region/per-race queries — see backend strategy doc §3. Content
 * volume (~40K words total) doesn't justify pagination, and one query
 * means one cache key for the whole page.
 *
 * `races`/`measures` are the State/County path (separate documents
 * referencing this Region). `sections` is the City path — a Region's own
 * ordered raceGroup/measureGroup blocks, concatenated with every
 * specialDistrict's blocks that lists this Region in `citiesServed` (own
 * content first, districts in title order). See §11.
 */
export const GUIDE_QUERY = defineQuery(`
  *[_type == "region"] | order(tier asc, order asc) {
    _id,
    title,
    "slug": slug.current,
    tier,
    order,
    description,
    "races": *[_type == "race" && references(^._id)] | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      office,
      context,
      "entries": *[_type == "entry" && references(^._id)] | order(order asc) {
        _id,
        name,
        "slug": slug.current,
        photo,
        rating,
        reasoning,
      }
    },
    "measures": *[_type == "measure" && references(^._id)] | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      pros,
      cons,
      position,
    },
    "sections":
      coalesce(
        coalesce(sections, [])[]{${sectionFields}}
        + (*[_type == "specialDistrict" && references(^._id)] | order(title asc)).sections[]{${sectionFields}},
        []
      )
  }
`)
