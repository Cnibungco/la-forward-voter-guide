import {describe, expect, it, vi} from 'vitest'

import {isTransientFetchError, withTransientRetries} from '@/lib/transientFetch'

describe('isTransientFetchError', () => {
  it('matches Node\'s TypeError: fetch failed', () => {
    expect(isTransientFetchError(new TypeError('fetch failed'))).toBe(true)
  })

  it('matches undici connection codes on the cause', () => {
    const error = new Error('request failed')
    error.cause = {code: 'UND_ERR_CONNECT_TIMEOUT'}
    expect(isTransientFetchError(error)).toBe(true)
  })

  it('does not match a GROQ or config error', () => {
    expect(isTransientFetchError(new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID'))).toBe(
      false,
    )
  })
})

describe('withTransientRetries', () => {
  it('returns the first successful result', async () => {
    const run = vi.fn().mockResolvedValue('ok')
    await expect(withTransientRetries(run, 3)).resolves.toBe('ok')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('retries fetch failed, then succeeds', async () => {
    const run = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce('ok')
    const sleep = vi.fn().mockResolvedValue(undefined)
    await expect(withTransientRetries(run, 3, sleep)).resolves.toBe('ok')
    expect(run).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
  })

  it('does not retry a non-transient error', async () => {
    const run = vi.fn().mockRejectedValue(new Error('GROQ query parse error'))
    await expect(withTransientRetries(run, 3)).rejects.toThrow('GROQ query parse error')
    expect(run).toHaveBeenCalledTimes(1)
  })
})
