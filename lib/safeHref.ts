/**
 * Shared check for editor-supplied URLs. Drops script and data URLs.
 * Relative, mailto, and tel links stay usable.
 */
export function safeHref(href: string | null | undefined): string | undefined {
  if (typeof href !== 'string') return undefined
  const trimmed = href.trim()
  if (!trimmed) return undefined
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return undefined
  return trimmed
}
