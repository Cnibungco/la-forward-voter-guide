import {defineQuery} from 'next-sanity'

const notDraft = `contentStatus != "draft"`

/**
 * Shared projection for a `raceGroup`/`measureGroup` block. Used for a
 * Region's own `sections` and for each `specialDistrict`. Districts are
 * returned once, under `specialDistricts`, and joined to cities in the
 * app by `citiesServed`.
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
 * referencing this Region). `sections` is a city's own ordered
 * raceGroup/measureGroup blocks. `specialDistricts` is every school and
 * special district, once, with the cities it covers. The app places
 * those districts on the city page and the matched ballot.
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
      candidateName,
      rating,
      reasoning,
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
    "sections": coalesce(sections, [])[]{${sectionFields}}
  },
  "specialDistricts": *[_type == "specialDistrict"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "citiesServed": citiesServed[]->{
      _id,
      title,
      "slug": slug.current
    },
    "sections": coalesce(sections, [])[]{${sectionFields}}
  },
  "settings": *[_id == "siteSettings"][0]{
    disclaimer,
    sampleBallotUrl,
    announcement,
    announcementLinkLabel,
    announcementLinkUrl,
    keyDates[]{
      _key,
      date,
      event,
      electionDay
    },
    aboutSummary,
    aboutParagraphs[]{
      _key,
      text
    },
    trustStatement,
    donateAsk,
    campaignDonor
  }
}`)
