import type {BeforeSendEvent} from '@vercel/analytics/next'

/** Drop query and hash so a URL can never carry an address into analytics. */
export function stripQueryAndHash(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.search = ''
    parsed.hash = ''
    return parsed.href
  } catch {
    const noHash = url.split('#')[0]
    return noHash.split('?')[0]
  }
}

/**
 * Page views only, with a clean path. Custom events are dropped so lookup
 * text cannot be attached later by accident. Hobby Vercel Analytics does
 * not report UTMs; GA4 still sees tagged links on the page URL.
 */
export function redactAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type === 'event') return null
  return {...event, url: stripQueryAndHash(event.url)}
}
