import type { EngagementView } from '@/lib/types'

export const MEDIA_FORMATS = ['video', 'podcast', 'interview', 'press'] as const
export type MediaFormat = (typeof MEDIA_FORMATS)[number]

export type MediaFilters = { format: string; topic: string; language: string }

type MediaEntry = Pick<
  EngagementView,
  'type' | 'hasVideo' | 'date' | 'endDate' | 'languages' | 'topics'
>

/**
 * Formats an engagement appears under in the media library: "video" when it has
 * a playable video, plus its own type for podcasts, interviews and press. A
 * filmed interview is therefore both a video and an interview.
 */
export function mediaFormats(entry: MediaEntry): MediaFormat[] {
  const formats: MediaFormat[] = []
  if (entry.hasVideo || entry.type === 'video') formats.push('video')
  if (entry.type === 'podcast' || entry.type === 'interview' || entry.type === 'press') {
    formats.push(entry.type)
  }
  return formats
}

/**
 * The media library lists recordings and coverage that already exist: a
 * video, podcast, interview or press entry whose date has passed. Upcoming
 * talks stay on the Speaking & Media page only.
 */
export function isMediaEntry(entry: MediaEntry, now: string): boolean {
  return mediaFormats(entry).length > 0 && (entry.endDate ?? entry.date) <= now
}

export function filterMedia<T extends MediaEntry>(entries: T[], filters: MediaFilters): T[] {
  return entries.filter((entry) => {
    if (filters.format && !mediaFormats(entry).includes(filters.format as MediaFormat)) {
      return false
    }
    if (filters.topic && !entry.topics.some((topic) => topic.slug === filters.topic)) return false
    if (filters.language && !entry.languages.includes(filters.language)) return false
    return true
  })
}
