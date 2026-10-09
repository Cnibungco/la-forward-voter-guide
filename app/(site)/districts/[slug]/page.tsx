import {notFound} from 'next/navigation'

import {CompactLegend} from '@/components/CompactLegend'
import {DistrictBlock} from '@/components/DistrictBlock'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {TapHint} from '@/components/TapHint'
import {expandableContentKind} from '@/lib/contentStatus'
import {TAP_HINT, TAP_HINT_MEASURE} from '@/lib/copy'
import {districtBySlug, hasDistrictSlug} from '@/lib/districts'
import {getGuide} from '@/lib/guide'
import {SCHOOL_DISTRICTS_LABEL} from '@/lib/labels'
import {resolvedTrustStatement} from '@/lib/siteSettings'

export const revalidate = 300

interface DistrictPageProps {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {specialDistricts} = await getGuide()
  return specialDistricts.filter(hasDistrictSlug).map((district) => ({slug: district.slug}))
}

export async function generateMetadata({params}: DistrictPageProps) {
  const {slug} = await params
  const {specialDistricts} = await getGuide()
  const district = districtBySlug(specialDistricts, slug)
  return {
    title: district ? `${district.title} · LA Forward Voter Guide` : 'LA Forward Voter Guide',
  }
}

export default async function DistrictPage({params}: DistrictPageProps) {
  const {slug} = await params
  const {regions, specialDistricts, settings} = await getGuide()
  const district = districtBySlug(specialDistricts, slug)
  if (!district) notFound()
  const hintKind = expandableContentKind([district])

  return (
    <GuideShell
      regions={regions}
      districts={specialDistricts}
      title={district.title}
      crumb={SCHOOL_DISTRICTS_LABEL}
      activeSlug={slug}
      pageNavScope="districts"
      showPageNav
    >
      <Methodology trustStatement={resolvedTrustStatement(settings)} />
      <CompactLegend />
      {hintKind && <TapHint>{hintKind === 'measure' ? TAP_HINT_MEASURE : TAP_HINT}</TapHint>}
      <DistrictBlock district={district} heading="none" />
    </GuideShell>
  )
}
