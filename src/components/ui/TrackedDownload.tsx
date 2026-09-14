'use client'

import type { ReactNode } from 'react'

import { trackEvent, type AnalyticsEvent } from '@/components/analytics/track'

/** Download link of a CMS document, counted as an analytics event. */
export function TrackedDownload({
  href,
  event,
  payload,
  className = '',
  children,
}: {
  href: string
  event: AnalyticsEvent
  payload?: Record<string, string>
  className?: string
  children: ReactNode
}) {
  return (
    <a href={href} download onClick={() => trackEvent(event, payload)} className={className}>
      {children}
    </a>
  )
}
