import {isDraftStatus, raceCandidates, visibleEntries} from '@/lib/contentStatus'
import {districtsOnCityPage, hasDistrictSlug} from '@/lib/districts'
import {SCHOOL_DISTRICTS_LABEL} from '@/lib/labels'
import {displayedRaceTitle} from '@/lib/raceLabel'
import {hasSlug} from '@/lib/regions'
import type {GuideDistrict, GuideRegion, GuideSection, MeasureLike, RaceLike} from '@/lib/types'

export interface GuideSearchHit {
  key: string
  href: string
  label: string
  context: string
}

const KIND_RANK = {name: 0, race: 1, measure: 2, region: 3} as const

type Kind = keyof typeof KIND_RANK

export interface IndexedSearchHit extends GuideSearchHit {
  kind: Kind
  /** Lowercased strings `searchGuide` tests. Stored so the browser does not need the guide body. */
  fields: string[]
}

const REGION_CONTEXT = {state: 'State', county: 'County', city: 'City'} as const

function searchFields(...values: Array<string | null | undefined>): string[] {
  const fields: string[] = []
  for (const value of values) {
    if (!value) continue
    fields.push(value.toLowerCase())
  }
  return fields
}

function pageHref(base: string, anchor: string | null | undefined): string {
  return anchor ? `${base}#${anchor}` : base
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

function racesIn(source: {races?: GuideRegion['races']; sections?: GuideRegion['sections']}): IndexedRace[] {
  const own = (source.races ?? [])
    .filter((race) => !isDraftStatus(race.contentStatus))
    .map((race) => indexRace(race, null))
  const grouped = (source.sections ?? []).flatMap((section) => {
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

export interface PageTopic {
  label: string
  anchor: string
}

type TopicSource = {
  races?: GuideRegion['races']
  measures?: GuideRegion['measures']
  sections?: GuideSection[]
}

function raceTopicLabel(race: IndexedRace): string {
  const display = displayedRaceTitle(race.title, race.sectionLabel).trim()
  if (display) return display
  const names = visibleEntries(race.entries)
    .map((entry) => entry.name.trim())
    .filter((name) => name.length > 0)
  if (names.length === 1) return names[0]
  const section = race.sectionLabel?.trim()
  if (section) return section
  return typeof race.title === 'string' ? race.title.trim() : ''
}

/** One link per published office or measure that has an anchor on the page. */
export function pageTopics(source: TopicSource): PageTopic[] {
  const topics: PageTopic[] = []
  for (const race of racesIn(source)) {
    const label = raceTopicLabel(race)
    if (!race.anchor || !label) continue
    topics.push({label, anchor: race.anchor})
  }
  for (const measure of measuresIn(source)) {
    const label = measure.title.trim()
    if (!measure.slug || !label) continue
    topics.push({label, anchor: measure.slug})
  }
  return topics
}

function dedupeTopics(topics: PageTopic[]): PageTopic[] {
  const seen = new Set<string>()
  return topics.filter((topic) => {
    if (seen.has(topic.anchor)) return false
    seen.add(topic.anchor)
    return true
  })
}

/** Offices on a guide page, including school districts rendered under a city. */
export function guidePageTopics(region: GuideRegion, districts: GuideDistrict[]): PageTopic[] {
  const sources = [region, ...districtsOnCityPage(region, districts)]
  return dedupeTopics(sources.flatMap((source) => pageTopics(source)))
}

function measuresIn(source: {measures?: GuideRegion['measures']; sections?: GuideRegion['sections']}): IndexedMeasure[] {
  const own = (source.measures ?? [])
    .filter((measure) => !isDraftStatus(measure.contentStatus))
    .map((measure) => indexMeasure(measure, null))
  const grouped = (source.sections ?? []).flatMap((section) => {
    if (section._type !== 'measureGroup') return []
    return (section.measures ?? [])
      .filter((measure) => !isDraftStatus(measure.contentStatus))
      .map((measure) => indexMeasure(measure, section.label))
  })
  return [...own, ...grouped]
}

function collectContentRecords(
  records: IndexedSearchHit[],
  parent: {id: string; title: string; base: string},
  races: IndexedRace[],
  measures: IndexedMeasure[],
) {
  for (const race of races) {
    records.push({
      kind: 'race',
      key: `race:${parent.id}:${race.key}`,
      href: pageHref(parent.base, race.anchor),
      label: race.title,
      context: parent.title,
      fields: searchFields(race.title, race.office, race.candidateName, race.sectionLabel),
    })

    for (const entry of raceCandidates(race)) {
      if (visibleEntries(race.entries).length === 0 && entry.name === race.title) continue
      records.push({
        kind: 'name',
        key: `entry:${entry._id}`,
        href: pageHref(parent.base, entry.slug ?? race.anchor),
        label: entry.name,
        context: race.title ? `${race.title} · ${parent.title}` : parent.title,
        fields: searchFields(entry.name),
      })
    }
  }

  for (const measure of measures) {
    records.push({
      kind: 'measure',
      key: `measure:${parent.id}:${measure.key}`,
      href: pageHref(parent.base, measure.slug),
      label: measure.title,
      context: parent.title,
      fields: searchFields(measure.title, measure.summary, measure.sectionLabel),
    })
  }
}

/**
 * Every sidebar search row, without the guide's write-ups. The browser
 * filters this list. `searchGuide` is the same walk plus a query.
 */
export function guideSearchIndex(
  regions: GuideRegion[],
  districts: GuideDistrict[] = [],
): IndexedSearchHit[] {
  const records: IndexedSearchHit[] = []

  for (const region of regions) {
    if (!hasSlug(region)) continue

    records.push({
      kind: 'region',
      key: `region:${region._id}`,
      href: `/guide/${region.slug}`,
      label: region.title,
      context: REGION_CONTEXT[region.tier],
      fields: searchFields(region.title),
    })

    collectContentRecords(
      records,
      {id: region._id, title: region.title, base: `/guide/${region.slug}`},
      racesIn(region),
      measuresIn(region),
    )
  }

  for (const district of districts) {
    if (!hasDistrictSlug(district)) continue
    const base = `/districts/${district.slug}`

    records.push({
      kind: 'region',
      key: `district:${district._id}`,
      href: base,
      label: district.title,
      context: SCHOOL_DISTRICTS_LABEL,
      fields: searchFields(district.title),
    })

    collectContentRecords(
      records,
      {id: district._id, title: district.title, base},
      racesIn(district),
      measuresIn(district),
    )
  }

  return records
}

export function filterGuideSearch(records: IndexedSearchHit[], rawQuery: string): GuideSearchHit[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []

  return records
    .filter((hit) => hit.fields.some((field) => field.includes(query)))
    .sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.label.localeCompare(b.label))
    .map(({key, href, label, context}) => ({key, href, label, context}))
}

/**
 * Sidebar search. Matches a jurisdiction, a district, a race, a candidate
 * name, or a measure — including a section label such as "Ballot measures"
 * — and links to that row when it has a slug. Each district is indexed
 * once, on its own page.
 */
export function searchGuide(
  regions: GuideRegion[],
  rawQuery: string,
  districts: GuideDistrict[] = [],
): GuideSearchHit[] {
  return filterGuideSearch(guideSearchIndex(regions, districts), rawQuery)
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
