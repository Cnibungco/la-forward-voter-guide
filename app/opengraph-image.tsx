import {getGuide} from '@/lib/guide'
import {shareImage, shareImageContentType, shareImageSize} from '@/lib/shareImage'
import {resolvedElectionName} from '@/lib/siteSettings'

export const alt = 'LA Forward Voter Guide'
export const size = shareImageSize
export const contentType = shareImageContentType
export const revalidate = 300

export default async function OpenGraphImage() {
  const {settings} = await getGuide()
  return shareImage(resolvedElectionName(settings))
}
