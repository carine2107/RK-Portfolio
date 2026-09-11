'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Icon } from '@/components/ui/Icon'

/**
 * LinkedIn and Facebook sharing plus "copy link".
 * Plain links — no third-party widget, no tracking script, no cookie.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const t = useTranslations('common')
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard permission denied — the URL stays visible in the address bar */
    }
  }

  const linkClasses =
    'inline-flex size-11 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:border-line-accent hover:text-accent-text'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs tracking-[0.14em] text-secondary uppercase">{t('share')}</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        <span className="sr-only">{t('shareLinkedin')}</span>
        <Icon name="linkedin" className="size-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        <span className="sr-only">{t('shareFacebook')}</span>
        <Icon name="facebook" className="size-4" />
      </a>
      <button type="button" onClick={copy} className={linkClasses}>
        <span className="sr-only">{t('copyLink')}</span>
        <Icon name="external" className="size-4" />
      </button>
      <span role="status" aria-live="polite" className="text-sm text-success-text">
        {copied ? t('linkCopied') : ''}
      </span>
    </div>
  )
}
