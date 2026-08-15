import {GuideBody} from '@/components/GuideBody'
import {getGuide} from '@/lib/guide'

export const revalidate = 300

export const metadata = {
  title: 'Your ballot · LA Forward Voter Guide',
}

export default async function BallotPage() {
  const regions = await getGuide()
  return <GuideBody regions={regions} />
}
