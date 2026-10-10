import {
  BLUESKY_HREF,
  INSTAGRAM_HREF,
  ORG_HREF,
  ORG_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TIKTOK_HREF,
} from '@/lib/copy'

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

export function siteStructuredData() {
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
        description: SITE_DESCRIPTION,
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
