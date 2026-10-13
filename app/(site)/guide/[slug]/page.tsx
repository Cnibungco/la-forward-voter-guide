import {notFound} from 'next/navigation'

import {CompactLegend} from '@/components/CompactLegend'
import {JsonLd} from '@/components/JsonLd'
import {DistrictBlock} from '@/components/DistrictBlock'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {PageContents} from '@/components/PageContents'
import {RegionSection} from '@/components/RegionSection'
import {TapHint} from '@/components/TapHint'
import {expandableContentKind} from '@/lib/contentStatus'
import {SITE_NAME, TAP_HINT, TAP_HINT_MEASURE, guideSnippet} from '@/lib/copy'
import {districtsOnCityPage} from '@/lib/districts'
import {getGuide} from '@/lib/guide'
import {guidePageTopics} from '@/lib/guideSearch'
import {TIER_LABELS} from '@/lib/labels'
import {hasSlug, regionBySlug} from '@/lib/regions'
import {breadcrumbStructuredData} from '@/lib/seo'
import {resolvedElectionName, resolvedTrustStatement} from '@/lib/siteSettings'

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
  const {regions, specialDistricts, settings} = await getGuide()
  const region = regionBySlug(regions, slug)
  if (!region?.slug) return {title: {absolute: SITE_NAME}}
  const topics = guidePageTopics(region, specialDistricts)
  return {
    title: region.title,
    description: guideSnippet(
      region.title,
      resolvedElectionName(settings),
      topics.map((topic) => topic.label),
    ),
    alternates: {canonical: `/guide/${region.slug}`},
  }
}

export default async function RegionPage({params}: RegionPageProps) {
  const {slug} = await params
  const {regions, specialDistricts, settings} = await getGuide()
  const region = regionBySlug(regions, slug)
  if (!region) notFound()
  const serving = districtsOnCityPage(region, specialDistricts)
  const topics = guidePageTopics(region, specialDistricts)
  const hintKind = expandableContentKind([region, ...serving])

  return (
    <>
      <JsonLd data={breadcrumbStructuredData(region.title, `/guide/${slug}`)} />
      <GuideShell
        regions={regions}
        districts={specialDistricts}
        title={region.title}
        crumb={TIER_LABELS[region.tier]}
        activeSlug={slug}
        showPageNav
      >
        <PageContents items={topics} />
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
    </>
  )
}
