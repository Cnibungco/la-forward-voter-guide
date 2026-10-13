import {
  BLUESKY_HREF,
  INSTAGRAM_HREF,
  ORG_HREF,
  ORG_NAME,
  SITE_NAME,
  SITE_URL,
  TIKTOK_HREF,
} from '@/lib/copy'
import {districtsOnCityPage} from '@/lib/districts'
import type {GuideDistrict, GuideRegion, GuideSection, SiteSettings} from '@/lib/types'

/** Company profile, without the feed-view query used by the on-site link. */
const LINKEDIN_PROFILE = 'https://www.linkedin.com/company/la-forward'

/**
 * Square mark cut from the wordmark. The full logo is a wide knockout
 * that disappears on a light background, so Google gets this icon instead.
 */
const ORG_LOGO_PATH = '/apple-icon.png'
const ORG_LOGO_SIZE = 180

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Paths search engines should crawl. Skips the address-matched ballot. */
export function publicGuidePaths(
  regions: {slug?: string | null}[],
  districts: {slug?: string | null}[],
): string[] {
  const paths = [
    '/',
    '/cities',
    '/outside',
    ...regions.flatMap((region) => (region.slug ? [`/guide/${region.slug}`] : [])),
    ...districts.flatMap((district) => (district.slug ? [`/districts/${district.slug}`] : [])),
  ]
  return [...new Set(paths)]
}

export function siteStructuredData(description: string) {
  const orgId = `${ORG_HREF}/#organization`
  const siteId = `${SITE_URL}/#website`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: ORG_NAME,
        url: ORG_HREF,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl(ORG_LOGO_PATH),
          width: ORG_LOGO_SIZE,
          height: ORG_LOGO_SIZE,
        },
        sameAs: [INSTAGRAM_HREF, BLUESKY_HREF, TIKTOK_HREF, LINKEDIN_PROFILE],
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description,
        publisher: {'@id': orgId},
      },
    ],
  }
}

export function breadcrumbStructuredData(pageName: string, pagePath: string) {
  const crumbs = [
    {name: SITE_NAME, path: '/'},
    {name: pageName, path: pagePath},
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/** Keep `<` out of the script body so a title cannot close the tag. */
export function jsonLdHtml(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Newest ISO timestamp. Sanity `_updatedAt` values sort as strings. */
export function latestTimestamp(stamps: Array<string | null | undefined>): string | undefined {
  const values = stamps
    .map((stamp) => stamp?.trim())
    .filter((stamp): stamp is string => Boolean(stamp))
  if (values.length === 0) return undefined
  return values.reduce((latest, stamp) => (stamp > latest ? stamp : latest))
}

function contentTimestamps(source: {
  updatedAt?: string | null
  races?: GuideRegion['races'] | null
  measures?: GuideRegion['measures'] | null
  sections?: GuideSection[] | null
}): Array<string | null | undefined> {
  const stamps: Array<string | null | undefined> = [source.updatedAt]
  for (const race of source.races ?? []) {
    stamps.push(race.updatedAt)
    for (const entry of race.entries ?? []) stamps.push(entry?.updatedAt)
  }
  for (const measure of source.measures ?? []) stamps.push(measure.updatedAt)
  for (const section of source.sections ?? []) {
    if (section._type === 'raceGroup') {
      for (const race of section.races ?? []) {
        stamps.push(race.updatedAt)
        for (const entry of race.entries ?? []) stamps.push(entry?.updatedAt)
      }
    } else {
      for (const measure of section.measures ?? []) stamps.push(measure.updatedAt)
    }
  }
  return stamps
}

export interface SitemapEntry {
  path: string
  lastModified?: string
}

/**
 * Public URLs plus the newest edit that shows on that URL.
 * Home, the city index, and outside coverage use the newest stamp in the guide.
 */
export function guideSitemap(guide: {
  regions: GuideRegion[]
  specialDistricts: GuideDistrict[]
  settings: SiteSettings | null
}): SitemapEntry[] {
  const paths = publicGuidePaths(guide.regions, guide.specialDistricts)
  const everything = [
    guide.settings?.updatedAt,
    ...guide.regions.flatMap((region) => contentTimestamps(region)),
    ...guide.specialDistricts.flatMap((district) => contentTimestamps(district)),
  ]
  const siteWide = latestTimestamp(everything)

  return paths.map((path) => {
    const lastModified = lastModifiedFor(path, guide, siteWide)
    return lastModified ? {path, lastModified} : {path}
  })
}

function lastModifiedFor(
  path: string,
  guide: {regions: GuideRegion[]; specialDistricts: GuideDistrict[]},
  siteWide: string | undefined,
): string | undefined {
  if (path === '/' || path === '/cities' || path === '/outside') return siteWide

  const guideSlug = path.startsWith('/guide/') ? path.slice('/guide/'.length) : null
  if (guideSlug) {
    const region = guide.regions.find((item) => item.slug === guideSlug)
    if (!region) return undefined
    const related = districtsOnCityPage(region, guide.specialDistricts)
    return latestTimestamp([
      ...contentTimestamps(region),
      ...related.flatMap((district) => contentTimestamps(district)),
    ])
  }

  const districtSlug = path.startsWith('/districts/') ? path.slice('/districts/'.length) : null
  if (districtSlug) {
    const district = guide.specialDistricts.find((item) => item.slug === districtSlug)
    return district ? latestTimestamp(contentTimestamps(district)) : undefined
  }

  return undefined
}
