import {notFound} from 'next/navigation'

import {CompactLegend} from '@/components/CompactLegend'
import {DistrictBlock} from '@/components/DistrictBlock'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {RegionSection} from '@/components/RegionSection'
import {TapHint} from '@/components/TapHint'
import {expandableContentKind} from '@/lib/contentStatus'
import {TAP_HINT, TAP_HINT_MEASURE} from '@/lib/copy'
import {districtHasContent, districtsServingCity} from '@/lib/districts'
import {getGuide} from '@/lib/guide'
import {TIER_LABELS} from '@/lib/labels'
import {hasSlug, regionBySlug} from '@/lib/regions'
import {resolvedTrustStatement} from '@/lib/siteSettings'

export const revalidate = 300

interface RegionPageProps {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {regions} = await getGuide()
  return regions.filter(hasSlug).map((region) => ({slug: region.slug}))
}

export async function generateMetadata({params}: RegionPageProps) {
  const {slug} = await params
  const {regions} = await getGuide()
  const region = regionBySlug(regions, slug)
  return {
    title: region ? `${region.title} · LA Forward Voter Guide` : 'LA Forward Voter Guide',
  }
}

export default async function RegionPage({params}: RegionPageProps) {
  const {slug} = await params
  const {regions, specialDistricts, settings} = await getGuide()
  const region = regionBySlug(regions, slug)
  if (!region) notFound()
  const serving =
    region.tier === 'city' ? districtsServingCity(specialDistricts, region.slug).filter(districtHasContent) : []
  const hintKind = expandableContentKind([region, ...serving])

  return (
    <GuideShell
      regions={regions}
      districts={specialDistricts}
      title={region.title}
      crumb={TIER_LABELS[region.tier]}
      activeSlug={slug}
      showPageNav
    >
      <Methodology trustStatement={resolvedTrustStatement(settings)} />
      <CompactLegend />
      {hintKind && (
        <TapHint>{hintKind === 'measure' ? TAP_HINT_MEASURE : TAP_HINT}</TapHint>
      )}
      <RegionSection region={region} suppressEmpty={serving.length > 0} />
      {serving.map((district) => (
        <DistrictBlock key={district._id} district={district} linkTitle />
      ))}
    </GuideShell>
  )
}
