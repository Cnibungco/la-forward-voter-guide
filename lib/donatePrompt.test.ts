import {afterEach, describe, expect, it, vi} from 'vitest'

import {
  DONATE_PROMPT_DELAY_MS,
  DONATE_PROMPT_STORAGE_KEY,
  hasSeenDonatePrompt,
  markDonatePromptSeen,
} from '@/lib/donatePrompt'

function memoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.get(key) ?? null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, value)
    },
  }
}

describe('donatePrompt', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('waits 30 seconds, then remembers the dialog was shown', () => {
    expect(DONATE_PROMPT_DELAY_MS).toBe(30_000)
    vi.stubGlobal('localStorage', memoryStorage())
    expect(hasSeenDonatePrompt()).toBe(false)
    markDonatePromptSeen()
    expect(localStorage.getItem(DONATE_PROMPT_STORAGE_KEY)).toBe('1')
    expect(hasSeenDonatePrompt()).toBe(true)
  })

  it('stays unseen when storage is blocked', () => {
    const blocked: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }
    vi.stubGlobal('localStorage', blocked)
    expect(hasSeenDonatePrompt()).toBe(false)
    expect(() => markDonatePromptSeen()).not.toThrow()
  })
})
