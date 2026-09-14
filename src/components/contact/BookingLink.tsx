'use client'

import { useTranslations } from 'next-intl'

import { trackEvent } from '@/components/analytics/track'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { displayHost } from '@/lib/url'

/**
 * Link to the external booking tool (Cal.com, Calendly…). Nothing from that
 * tool is embedded or loaded on the site: the visitor is told where the link
 * leads, and the tool opens in a new tab only when clicked.
 */
export function BookingLink({
  url,
  label,
  location,
  variant = 'primary',
  className = '',
}: {
  url: string
  label?: string
  location: string
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string
}) {
  const t = useTranslations('contact.booking')
  const host = displayHost(url)

  return (
    <div className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('booking_click', { location })}
        className={buttonClasses(variant, 'md', 'w-full sm:w-auto')}
      >
        <Icon name="calendar" className="size-4" />
        {label || t('cta')}
        <Icon name="external" className="size-4" />
        <span className="sr-only">({t('opensIn', { host })})</span>
      </a>
      <p className="mt-2 text-xs text-secondary">{t('opensIn', { host })}</p>
    </div>
  )
}
