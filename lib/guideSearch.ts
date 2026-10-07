import {isDraftStatus, visibleEntries} from '@/lib/contentStatus'
import {hasSlug} from '@/lib/regions'
import type {GuideRegion, MeasureLike, RaceLike} from '@/lib/types'

export interface GuideSearchHit {
  key: string
  href: string
  label: string
  context: string
}

const KIND_RANK = {name: 0, race: 1, measure: 2, region: 3} as const

type Kind = keyof typeof KIND_RANK

interface ScoredHit extends GuideSearchHit {
  kind: Kind
}

const REGION_CONTEXT = {state: 'State', county: 'County', city: 'City'} as const

function matches(query: string, ...values: Array<string | null | undefined>): boolean {
  return values.some((value) => value?.toLowerCase().includes(query))
}

function guideHref(regionSlug: string, anchor: string | null | undefined): string {
  return anchor ? `/guide/${regionSlug}#${anchor}` : `/guide/${regionSlug}`
}

interface IndexedRace extends RaceLike {
  key: string
  anchor: string | null
  sectionLabel: string | null
}

interface IndexedMeasure extends MeasureLike {
  key: string
  sectionLabel: string | null
}

function indexRace(race: RaceLike & {_id?: string; _key?: string}, sectionLabel: string | null): IndexedRace {
  const anchor = race.slug ?? visibleEntries(race.entries).find((entry) => entry.slug)?.slug ?? null
  return {...race, key: race._id ?? race._key ?? race.slug ?? race.title, anchor, sectionLabel}
}

function racesIn(region: GuideRegion): IndexedRace[] {
  const own = region.races
    .filter((race) => !isDraftStatus(race.contentStatus))
    .map((race) => indexRace(race, null))
  const grouped = region.sections.flatMap((section) => {
    if (section._type !== 'raceGroup') return []
    return (section.races ?? [])
      .filter((race) => !isDraftStatus(race.contentStatus))
      .map((race) => indexRace(race, section.label))
  })
  return [...own, ...grouped]
}

function indexMeasure(
  measure: MeasureLike & {_id?: string; _key?: string},
  sectionLabel: string | null,
): IndexedMeasure {
  return {...measure, key: measure._id ?? measure._key ?? measure.slug ?? measure.title, sectionLabel}
}

function measuresIn(region: GuideRegion): IndexedMeasure[] {
  const own = region.measures
    .filter((measure) => !isDraftStatus(measure.contentStatus))
    .map((measure) => indexMeasure(measure, null))
  const grouped = region.sections.flatMap((section) => {
    if (section._type !== 'measureGroup') return []
    return (section.measures ?? [])
      .filter((measure) => !isDraftStatus(measure.contentStatus))
      .map((measure) => indexMeasure(measure, section.label))
  })
  return [...own, ...grouped]
}

/**
 * Sidebar search. Matches a jurisdiction, a race, a candidate name, or a
 * measure — including a section label such as "Ballot measures" — and
 * links to that row when it has a slug.
 */
export function searchGuide(regions: GuideRegion[], rawQuery: string): GuideSearchHit[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []

  const hits: ScoredHit[] = []

  for (const region of regions) {
    if (!hasSlug(region)) continue

    if (matches(query, region.title)) {
      hits.push({
        kind: 'region',
        key: `region:${region._id}`,
        href: `/guide/${region.slug}`,
        label: region.title,
        context: REGION_CONTEXT[region.tier],
      })
    }

    for (const race of racesIn(region)) {
      if (matches(query, race.title, race.office, race.sectionLabel)) {
        hits.push({
          kind: 'race',
          key: `race:${region._id}:${race.key}`,
          href: guideHref(region.slug, race.anchor),
          label: race.title,
          context: region.title,
        })
      }

      for (const entry of visibleEntries(race.entries)) {
        if (!matches(query, entry.name)) continue
        hits.push({
          kind: 'name',
          key: `entry:${entry._id}`,
          href: guideHref(region.slug, entry.slug ?? race.anchor),
          label: entry.name,
          context: race.title ? `${race.title} · ${region.title}` : region.title,
        })
      }
    }

    for (const measure of measuresIn(region)) {
      if (!matches(query, measure.title, measure.summary, measure.sectionLabel)) continue
      hits.push({
        kind: 'measure',
        key: `measure:${region._id}:${measure.key}`,
        href: guideHref(region.slug, measure.slug),
        label: measure.title,
        context: region.title,
      })
    }
  }

  return hits
    .sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.label.localeCompare(b.label))
    .map(({key, href, label, context}) => ({key, href, label, context}))
}

/** Scroll a guide row into view and open it when it is a collapsed write-up. */
export function revealGuideAnchor(id: string): boolean {
  if (typeof document === 'undefined') return false
  const el = document.getElementById(id)
  if (!el) return false
  if (el instanceof HTMLDetailsElement) el.open = true
  el.scrollIntoView({block: 'start'})
  return true
}
