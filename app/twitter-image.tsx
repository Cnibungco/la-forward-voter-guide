import {getGuide} from '@/lib/guide'
import {shareImage, shareImageContentType, shareImageSize} from '@/lib/shareImage'
import {resolvedElectionName} from '@/lib/siteSettings'

export const alt = 'LA Forward Voter Guide'
export const size = shareImageSize
export const contentType = shareImageContentType
export const revalidate = 3600

export default async function TwitterImage() {
  const {settings} = await getGuide()
  return shareImage(resolvedElectionName(settings))
}
