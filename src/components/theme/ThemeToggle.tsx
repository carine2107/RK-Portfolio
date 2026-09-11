'use client'

import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

import { trackEvent } from '@/components/analytics/track'

import { THEME_PREFERENCES, type ThemePreference } from './theme-constants'
import {
  applyPreference,
  getServerThemePreference,
  getThemePreference,
  subscribeTheme,
} from './theme-store'

const ICONS: Record<ThemePreference, React.ReactNode> = {
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />,
  system: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
}

/**
 * Three-state theme control (light / dark / system) rendered as a radio group,
 * so screen readers announce the options and which one is active.
 */
export function ThemeToggle({
  className = '',
  size = 'md',
}: {
  className?: string
  /** `sm` (32 px) fits the crowded desktop header; `md` (36 px) is used elsewhere. */
  size?: 'sm' | 'md'
}) {
  const t = useTranslations('theme')
  const preference = useSyncExternalStore(
    subscribeTheme,
    getThemePreference,
    getServerThemePreference,
  )

  const select = (next: ThemePreference) => {
    applyPreference(next)
    trackEvent('theme_change', { theme: next })
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('label')}
      data-testid="theme-toggle"
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-surface-subtle p-0.5 ${className}`}
    >
      {THEME_PREFERENCES.map((option) => {
        const active = preference === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(option)}
            title={t(option)}
            data-theme-option={option}
            onClick={() => select(option)}
            className={[
              'inline-flex items-center justify-center rounded-full transition-colors duration-150',
              size === 'sm' ? 'size-8 min-h-8' : 'size-9 min-h-9',
              active
                ? 'bg-surface text-primary shadow-card'
                : 'text-secondary hover:bg-surface/70 hover:text-primary',
            ].join(' ')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              {ICONS[option]}
            </svg>
          </button>
        )
      })}
    </div>
  )
}
