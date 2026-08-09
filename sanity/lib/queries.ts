import {defineQuery} from 'next-sanity'

/**
 * The whole guide, in one request. Deliberately not split into
 * per-region/per-race queries — see backend strategy doc §3. Content
 * volume (~40K words total) doesn't justify pagination, and one query
 * means one cache key for the whole page.
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
      recommendation,
    }
  }
`)
