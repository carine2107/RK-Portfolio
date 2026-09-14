import { describe, expect, it } from 'vitest'

import { filterMedia, isMediaEntry, mediaFormats } from '@/lib/media-library'

const NOW = '2026-09-14T12:00:00.000Z'

const entry = (overrides: Partial<Parameters<typeof mediaFormats>[0]> & { id?: string } = {}) => ({
  id: 'x',
  type: 'conference' as const,
  hasVideo: false,
  date: '2026-05-01T10:00:00.000Z',
  endDate: null,
  languages: [] as string[],
  topics: [] as { slug: string; title: string }[],
  ...overrides,
})

describe('media library', () => {
  it('classifies entries by format', () => {
    expect(mediaFormats(entry({ type: 'interview', hasVideo: true }))).toEqual([
      'video',
      'interview',
    ])
    expect(mediaFormats(entry({ type: 'podcast' }))).toEqual(['podcast'])
    expect(mediaFormats(entry({ type: 'video' }))).toEqual(['video'])
    expect(mediaFormats(entry({ type: 'conference', hasVideo: true }))).toEqual(['video'])
    expect(mediaFormats(entry({ type: 'workshop' }))).toEqual([])
  })

  it('lists only past recordings and coverage', () => {
    expect(isMediaEntry(entry({ type: 'podcast' }), NOW)).toBe(true)
    expect(isMediaEntry(entry({ type: 'conference', hasVideo: true }), NOW)).toBe(true)
    expect(isMediaEntry(entry({ type: 'conference' }), NOW)).toBe(false)
    expect(isMediaEntry(entry({ type: 'podcast', date: '2026-12-01T10:00:00.000Z' }), NOW)).toBe(
      false,
    )
  })

  it('combines format, topic and language filters', () => {
    const entries = [
      entry({
        id: 'a',
        type: 'interview',
        hasVideo: true,
        languages: ['fr'],
        topics: [{ slug: 'real-estate', title: 'Real estate' }],
      }),
      entry({ id: 'b', type: 'podcast', languages: ['en'] }),
      entry({ id: 'c', type: 'press', languages: ['de', 'fr'] }),
    ]
    const ids = (filters: { format?: string; topic?: string; language?: string }) =>
      filterMedia(entries, { format: '', topic: '', language: '', ...filters }).map((e) => e.id)

    expect(ids({})).toEqual(['a', 'b', 'c'])
    expect(ids({ format: 'video' })).toEqual(['a'])
    expect(ids({ format: 'interview' })).toEqual(['a'])
    expect(ids({ language: 'fr' })).toEqual(['a', 'c'])
    expect(ids({ topic: 'real-estate', language: 'en' })).toEqual([])
  })
})
