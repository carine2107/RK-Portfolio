'use client'

import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

import { trackEvent } from '@/components/analytics/track'

import {
  applyPreference,
  getResolvedTheme,
  getServerResolvedTheme,
  subscribeTheme,
} from './theme-store'

/**
 * Day / night switch: one toggle button ("Dark mode", pressed when the dark theme
 * is displayed). Until the visitor clicks it the site follows the system
 * preference; a click stores an explicit light or dark choice.
 *
 * The icon shows the theme a click switches to: a moon in light mode, a sun in
 * dark mode. Its meaning is carried by the label and `aria-pressed`, not by the
 * icon alone.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('theme')
  const theme = useSyncExternalStore(subscribeTheme, getResolvedTheme, getServerResolvedTheme)
  const dark = theme === 'dark'

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    applyPreference(next)
    trackEvent('theme_change', { theme: next })
  }

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-pressed={dark}
      title={t('darkMode')}
      onClick={toggle}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-primary transition-colors hover:border-line-accent hover:text-accent-text ${className}`}
    >
      <span className="sr-only">{t('darkMode')}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[1.125rem]"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  )
}
