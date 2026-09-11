'use client'

import { useEffect, useRef } from 'react'

import { trackEvent, type AnalyticsEvent } from '@/components/analytics/track'

/**
 * Reports a page-level analytics event once per mount (article read, book page
 * opened…). Renders nothing. When no analytics provider is configured the call
 * is a no-op — see `track.ts`.
 */
export function TrackView({
  event,
  id,
  category,
}: {
  event: AnalyticsEvent
  id: string
  category?: string
}) {
  const reported = useRef(false)

  useEffect(() => {
    if (reported.current) return
    reported.current = true
    trackEvent(event, category ? { id, category } : { id })
  }, [event, id, category])

  return null
}
