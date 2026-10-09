import {GuideBody} from '@/components/GuideBody'
import {getGuide} from '@/lib/guide'
import {resolvedTrustStatement} from '@/lib/siteSettings'

export const revalidate = 300

export const metadata = {
  title: 'Your ballot · LA Forward Voter Guide',
}

export default async function BallotPage() {
  const {regions, settings} = await getGuide()
  return <GuideBody regions={regions} trustStatement={resolvedTrustStatement(settings)} />
}
