'use client'

import type { ReactNode } from 'react'

import { trackEvent, type AnalyticsEvent } from '@/components/analytics/track'

/**
 * External link that reports an analytics event. Always opens in a new tab with
 * `rel="noopener noreferrer"`; the visible label carries the accessible name.
 */
export function ExternalLink({
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent(event, payload)}
      className={className}
    >
      {children}
    </a>
  )
}
