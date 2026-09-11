'use client'

import type { ReactNode } from 'react'

import { trackEvent, type AnalyticsEvent } from '@/components/analytics/track'
import { buttonClasses } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'

/**
 * Internal link that reports an analytics event. Used from server components,
 * which cannot attach event handlers themselves.
 */
export function CtaLink({
  href,
  event,
  location,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  plain = false,
}: {
  href: string
  event: AnalyticsEvent
  location: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'onContrast'
  size?: 'md' | 'lg'
  className?: string
  children: ReactNode
  plain?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent(event, { location })}
      className={plain ? className : buttonClasses(variant, size, className)}
    >
      {children}
    </Link>
  )
}
