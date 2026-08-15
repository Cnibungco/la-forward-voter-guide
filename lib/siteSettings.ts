import {DEFAULT_DISCLAIMER} from '@/lib/copy'
import type {SiteSettings} from '@/lib/types'

export function resolvedDisclaimer(settings: SiteSettings | null | undefined): string {
  return settings?.disclaimer?.trim() || DEFAULT_DISCLAIMER
}

export function resolvedSampleBallotUrl(settings: SiteSettings | null | undefined): string | null {
  const url = settings?.sampleBallotUrl?.trim()
  return url || null
}
