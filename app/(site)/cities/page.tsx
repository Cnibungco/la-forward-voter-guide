import {CityPicker} from '@/components/CityPicker'
import {GuideShell} from '@/components/GuideShell'
import {CITIES_TITLE, guidePageDescription} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {TIER_LABELS} from '@/lib/labels'

export const revalidate = 300

export const metadata = {
  title: 'Find your city',
  description: guidePageDescription('Find your city'),
  alternates: {canonical: '/cities'},
}

export default async function CitiesPage() {
  const {regions, specialDistricts} = await getGuide()

  return (
    <GuideShell regions={regions} districts={specialDistricts} title={CITIES_TITLE} crumb={TIER_LABELS.city}>
      <CityPicker regions={regions} />
    </GuideShell>
  )
}
