import {SHARE_TEXT} from '@/lib/copy'

/** Canonical link to put in a share: the guide home, not the page they were on. */
export function shareGuideUrl(origin: string): string {
  return new URL('/', origin).href
}

/** Clipboard fallback. The share sheet gets the line and the URL as separate fields. */
export function shareGuideText(origin: string): string {
  return `${SHARE_TEXT} ${shareGuideUrl(origin)}`
}
