import {revalidatePath, revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

import {
  GUIDE_CACHE_TAG,
  GUIDE_DYNAMIC_PATH,
  GUIDE_PATHS,
  shouldRefreshGuide,
  type GuideWebhookBody,
} from '@/lib/guideRevalidate'

/**
 * Sanity calls this when a guide document is saved. Studio uses liveEdit,
 * so "publish" is an editor setting Content status to Published and the
 * document saving immediately — there may be no separate Publish button.
 *
 * `parseBody` checks the `sanity-webhook-signature` header against
 * `SANITY_REVALIDATE_SECRET` and, on a valid signature, waits briefly so
 * the Content Lake has caught up before the next `getGuide()` read.
 * The 5-minute ISR on the guide pages stays as the fallback.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({message: 'Revalidation is not configured'}, {status: 500})
  }

  let parsed: {isValidSignature: boolean | null; body: GuideWebhookBody | null}
  try {
    // The third argument waits for the Content Lake so the refetch below
    // does not read the pre-save document. `getGuide()` also skips the CDN.
    parsed = await parseBody<GuideWebhookBody>(req, secret, true)
  } catch {
    return NextResponse.json({message: 'Bad request'}, {status: 400})
  }

  if (parsed.isValidSignature !== true) {
    return NextResponse.json({message: 'Invalid signature'}, {status: 401})
  }

  if (!shouldRefreshGuide(parsed.body)) {
    return NextResponse.json({revalidated: false})
  }

  revalidateTag(GUIDE_CACHE_TAG)
  for (const path of GUIDE_PATHS) {
    revalidatePath(path)
  }
  revalidatePath(GUIDE_DYNAMIC_PATH, 'page')

  return NextResponse.json({revalidated: true})
}
