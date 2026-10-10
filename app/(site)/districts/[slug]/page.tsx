import {notFound} from 'next/navigation'

import {CompactLegend} from '@/components/CompactLegend'
import {JsonLd} from '@/components/JsonLd'
import {DistrictBlock} from '@/components/DistrictBlock'
import {GuideShell} from '@/components/GuideShell'
import {Methodology} from '@/components/Methodology'
import {TapHint} from '@/components/TapHint'
import {expandableContentKind} from '@/lib/contentStatus'
import {SITE_NAME, TAP_HINT, TAP_HINT_MEASURE, guidePageDescription} from '@/lib/copy'
import {districtBySlug, hasDistrictSlug} from '@/lib/districts'
import {getGuide} from '@/lib/guide'
import {SCHOOL_DISTRICTS_LABEL} from '@/lib/labels'
import {breadcrumbStructuredData} from '@/lib/seo'
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
  if (!district?.slug) return {title: {absolute: SITE_NAME}}
  return {
    title: district.title,
    description: guidePageDescription(district.title),
    alternates: {canonical: `/districts/${district.slug}`},
  }
}

export default async function DistrictPage({params}: DistrictPageProps) {
  const {slug} = await params
  const {regions, specialDistricts, settings} = await getGuide()
  const district = districtBySlug(specialDistricts, slug)
  if (!district) notFound()
  const hintKind = expandableContentKind([district])

  return (
    <>
      <JsonLd data={breadcrumbStructuredData(district.title, `/districts/${slug}`)} />
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
    </>
  )
}
