const TRANSIENT_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
  'UND_ERR_HEADERS_TIMEOUT',
])

function causeCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('cause' in error)) {
    return null
  }
  const cause = error.cause
  if (typeof cause !== 'object' || cause === null || !('code' in cause)) {
    return null
  }
  const code = (cause as {code?: unknown}).code
  return typeof code === 'string' ? code : null
}

/** Node/undici wraps a dropped connection as TypeError: fetch failed. */
export function isTransientFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.message === 'fetch failed') return true
  const code = causeCode(error)
  return code !== null && TRANSIENT_CODES.has(code)
}

/**
 * Retry a Sanity (or other) fetch that failed because the network blipped.
 * Non-transient errors (bad query, missing project id) still fail on the
 * first throw so maintainers are not waiting on a loop.
 */
export async function withTransientRetries<T>(
  run: () => Promise<T>,
  attempts = 3,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await run()
    } catch (error) {
      lastError = error
      if (!isTransientFetchError(error) || i === attempts - 1) {
        throw error
      }
      await sleep(200 * (i + 1))
    }
  }
  throw lastError
}
