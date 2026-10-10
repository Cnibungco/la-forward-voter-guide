import {GuideBody} from '@/components/GuideBody'
import {guidePageDescription} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {resolvedTrustStatement} from '@/lib/siteSettings'

export const revalidate = 300

export const metadata = {
  title: 'Your ballot',
  description: guidePageDescription('Your ballot'),
  alternates: {canonical: '/ballot'},
}

export default async function BallotPage() {
  const {regions, specialDistricts, settings} = await getGuide()
  return (
    <GuideBody
      regions={regions}
      districts={specialDistricts}
      trustStatement={resolvedTrustStatement(settings)}
    />
  )
}
