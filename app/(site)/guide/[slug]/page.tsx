import {notFound} from 'next/navigation'

import {CompactLegend} from '@/components/CompactLegend'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {RegionSection} from '@/components/RegionSection'
import {getGuide} from '@/lib/guide'
import {TIER_CRUMBS} from '@/lib/labels'
import {hasSlug, regionBySlug} from '@/lib/regions'

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
  const {regions} = await getGuide()
  const region = regionBySlug(regions, slug)
  if (!region) notFound()

  return (
    <GuideShell regions={regions} title={region.title} crumb={TIER_CRUMBS[region.tier]} activeSlug={slug}>
      <Methodology />
      <CompactLegend />
      <RegionSection region={region} />
    </GuideShell>
  )
}
