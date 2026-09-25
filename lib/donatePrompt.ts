/**
 * Remembers that the first-visit donate dialog was shown. The value is
 * only "1" — never an address, a district, or anything else about the
 * visitor. localStorage (not sessionStorage) so it stays dismissed after
 * the tab closes.
 */
export const DONATE_PROMPT_STORAGE_KEY = 'la-forward-voter-guide:donate-prompt'

/** Half a minute of browsing before the first-visit dialog appears. */
export const DONATE_PROMPT_DELAY_MS = 30_000

export function hasSeenDonatePrompt(): boolean {
  try {
    return localStorage.getItem(DONATE_PROMPT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markDonatePromptSeen(): void {
  try {
    localStorage.setItem(DONATE_PROMPT_STORAGE_KEY, '1')
  } catch {
    // Private mode or quota — the dialog can show again on a later visit.
  }
}
