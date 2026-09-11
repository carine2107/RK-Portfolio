'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'

/**
 * "Download Expert Profile".
 *
 * When no document has been uploaded to the CMS the button does not pretend to
 * work: it explains that the document is not published yet and points to the
 * contact form.
 */
export function ExpertProfileButton({
  url,
  variant = 'secondary',
  size = 'md',
  className = '',
  location,
}: {
  url: string | null
  variant?: 'primary' | 'secondary' | 'accent' | 'onContrast'
  size?: 'md' | 'lg'
  className?: string
  location: string
}) {
  const t = useTranslations('common')
  const [showNotice, setShowNotice] = useState(false)

  if (url) {
    return (
      <a
        href={url}
        download
        onClick={() => trackEvent('expert_profile_download', { location })}
        className={buttonClasses(variant, size, className)}
      >
        <Icon name="download" className="size-4" />
        {t('downloadProfile')}
      </a>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShowNotice((value) => !value)}
        aria-expanded={showNotice}
        aria-controls="expert-profile-notice"
        className={buttonClasses(variant, size, className)}
      >
        <Icon name="download" className="size-4" />
        {t('downloadProfile')}
      </button>
      <p
        id="expert-profile-notice"
        role="status"
        hidden={!showNotice}
        className="max-w-sm rounded-card border border-warning-line bg-warning-surface px-3 py-2 text-sm text-warning-text"
      >
        {t('documentPendingBody')}{' '}
        <Link href="/contact" className="font-medium underline underline-offset-4">
          {t('getInTouch')}
        </Link>
      </p>
    </div>
  )
}
