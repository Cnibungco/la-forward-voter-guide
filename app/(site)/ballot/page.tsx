import type {Metadata} from 'next'

import {GuideBody} from '@/components/GuideBody'
import {guidePageDescription} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {resolvedElectionName, resolvedTrustStatement} from '@/lib/siteSettings'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const {settings} = await getGuide()
  return {
    title: 'Your ballot',
    description: guidePageDescription('Your ballot', resolvedElectionName(settings)),
    alternates: {canonical: '/ballot'},
    robots: {index: false, follow: true},
  }
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
