import {NextRequest} from 'next/server'
import {afterEach, describe, expect, it, vi} from 'vitest'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

import {revalidatePath, revalidateTag} from 'next/cache'

import {POST} from './route'

const SECRET = 'test-revalidate-secret'

async function signBody(body: string, secret: string, timestamp = Date.now()): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  )
  const encoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `t=${timestamp},v1=${encoded}`
}

function postWebhook(body: string, signature?: string) {
  const headers = new Headers({'content-type': 'application/json'})
  if (signature) headers.set('sanity-webhook-signature', signature)
  return POST(
    new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers,
      body,
    }),
  )
}

describe('POST /api/revalidate', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('rejects requests when the secret is not configured', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', '')
    const response = await postWebhook(JSON.stringify({_type: 'entry'}))
    expect(response.status).toBe(500)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rejects an unsigned request', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET)
    const response = await postWebhook(JSON.stringify({_type: 'entry', contentStatus: 'published'}))
    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('rejects a signature made with the wrong secret', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET)
    const body = JSON.stringify({_type: 'entry', contentStatus: 'published'})
    const response = await postWebhook(body, await signBody(body, 'other-secret'))
    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it(
    'revalidates the guide when the signature is valid',
    async () => {
      vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET)
      const body = JSON.stringify({
        _id: 'entry-1',
        _type: 'entry',
        contentStatus: 'published',
        beforeStatus: 'draft',
      })
      const response = await postWebhook(body, await signBody(body, SECRET))

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({revalidated: true})
      expect(revalidateTag).toHaveBeenCalledWith('guide')
      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/cities')
      expect(revalidatePath).toHaveBeenCalledWith('/ballot')
      expect(revalidatePath).toHaveBeenCalledWith('/outside')
      expect(revalidatePath).toHaveBeenCalledWith('/guide/[slug]', 'page')
    },
    10000,
  )

  it(
    'accepts a valid signature but skips a draft that was already hidden',
    async () => {
      vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET)
      const body = JSON.stringify({_type: 'entry', contentStatus: 'draft', beforeStatus: 'draft'})
      const response = await postWebhook(body, await signBody(body, SECRET))

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({revalidated: false})
      expect(revalidateTag).not.toHaveBeenCalled()
    },
    10000,
  )
})
