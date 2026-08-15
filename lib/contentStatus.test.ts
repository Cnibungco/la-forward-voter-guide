import {describe, expect, it} from 'vitest'

import {
  entryNeedsWriteup,
  isDraftStatus,
  isPendingStatus,
  measureNeedsWriteup,
  raceNeedsWriteup,
  visibleEntries,
} from './contentStatus'
import type {GuideEntry, MeasureLike, RaceLike} from './types'

const entry = (overrides: Partial<GuideEntry>): GuideEntry => ({
  _id: 'e1',
  name: 'Jane Doe',
  slug: 'jane',
  photo: null,
  rating: null,
  reasoning: null,
  ...overrides,
})

const measure = (overrides: Partial<MeasureLike>): MeasureLike => ({
  title: 'Measure A',
  slug: 'a',
  summary: null,
  position: null,
  pros: null,
  cons: null,
  ...overrides,
})

const race = (overrides: Partial<RaceLike>): RaceLike => ({
  title: 'Mayor',
  slug: 'mayor',
  office: null,
  district: null,
  context: null,
  entries: null,
  ...overrides,
})

describe('isPendingStatus / isDraftStatus', () => {
  it('is pending only for pending', () => {
    expect(isPendingStatus('pending')).toBe(true)
    expect(isPendingStatus('published')).toBe(false)
    expect(isPendingStatus('draft')).toBe(false)
    expect(isPendingStatus(null)).toBe(false)
    expect(isPendingStatus(undefined)).toBe(false)
  })

  it('is draft only for draft', () => {
    expect(isDraftStatus('draft')).toBe(true)
    expect(isDraftStatus('pending')).toBe(false)
    expect(isDraftStatus(undefined)).toBe(false)
  })
})

describe('visibleEntries', () => {
  it('drops draft candidates and treats null as empty', () => {
    expect(visibleEntries(null)).toEqual([])
    expect(
      visibleEntries([
        entry({_id: 'draft', contentStatus: 'draft', rating: 'endorsed'}),
        entry({_id: 'live', contentStatus: 'published', rating: 'endorsed'}),
      ]).map((item) => item._id),
    ).toEqual(['live'])
  })
})

describe('entryNeedsWriteup', () => {
  it('treats pending status or a missing rating as coming soon', () => {
    expect(entryNeedsWriteup(entry({contentStatus: 'pending', rating: 'endorsed'}))).toBe(true)
    expect(entryNeedsWriteup(entry({contentStatus: 'published', rating: null}))).toBe(true)
  })

  it('does not treat No Recommendation as missing data', () => {
    expect(entryNeedsWriteup(entry({contentStatus: 'published', rating: 'no_recommendation'}))).toBe(false)
  })

  it('treats a pre-status document with a rating as ready, and without one as coming soon', () => {
    expect(entryNeedsWriteup(entry({rating: 'endorsed'}))).toBe(false)
    expect(entryNeedsWriteup(entry({rating: null}))).toBe(true)
  })

  it('does not flag a leaked draft as coming soon (the row should hide instead)', () => {
    expect(entryNeedsWriteup(entry({contentStatus: 'draft', rating: 'endorsed'}))).toBe(false)
  })
})

describe('measureNeedsWriteup', () => {
  it('treats pending status or a missing position as coming soon', () => {
    expect(measureNeedsWriteup(measure({contentStatus: 'pending', position: 'support'}))).toBe(true)
    expect(measureNeedsWriteup(measure({contentStatus: 'published', position: null}))).toBe(true)
  })

  it('does not treat No Position as missing data', () => {
    expect(measureNeedsWriteup(measure({contentStatus: 'published', position: 'no_position'}))).toBe(false)
  })
})

describe('raceNeedsWriteup', () => {
  it('is coming soon when the race is pending or has no candidates', () => {
    expect(raceNeedsWriteup(race({contentStatus: 'pending', entries: [entry({rating: 'endorsed'})]}))).toBe(true)
    expect(raceNeedsWriteup(race({contentStatus: 'published', entries: []}))).toBe(true)
    expect(raceNeedsWriteup(race({contentStatus: 'published', entries: null}))).toBe(true)
  })

  it('is not coming soon when it has visible candidates', () => {
    expect(raceNeedsWriteup(race({contentStatus: 'published', entries: [entry({rating: 'endorsed'})]}))).toBe(false)
  })

  it('treats a race whose only candidates are drafts as empty', () => {
    expect(
      raceNeedsWriteup(
        race({
          contentStatus: 'published',
          entries: [entry({contentStatus: 'draft', rating: 'endorsed'})],
        }),
      ),
    ).toBe(true)
  })

  it('does not flag a leaked draft race as coming soon (the block should hide instead)', () => {
    expect(raceNeedsWriteup(race({contentStatus: 'draft', entries: []}))).toBe(false)
  })
})
