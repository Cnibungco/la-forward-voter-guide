import type {Metadata} from 'next'

import {CityPicker} from '@/components/CityPicker'
import {GuideShell} from '@/components/GuideShell'
import {CITIES_TITLE, guidePageDescription} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {shellModel} from '@/lib/shellPayload'
import {TIER_LABELS} from '@/lib/labels'
import {resolvedElectionName} from '@/lib/siteSettings'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const {settings} = await getGuide()
  return {
    title: 'Find your city',
    description: guidePageDescription('Find your city', resolvedElectionName(settings)),
    alternates: {canonical: '/cities'},
  }
}

export default async function CitiesPage() {
  const {regions, specialDistricts} = await getGuide()
  const model = shellModel(regions, specialDistricts)

  return (
    <GuideShell model={model} title={CITIES_TITLE} crumb={TIER_LABELS.city}>
      <CityPicker cities={model.cities} />
    </GuideShell>
  )
}
