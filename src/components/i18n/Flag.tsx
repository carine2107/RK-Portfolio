'use client'

import { useId } from 'react'

import type { Locale } from '@/i18n/routing'

/**
 * Small flag drawn inline (no image request, no external asset, works offline).
 *
 * A flag names a country, not a language: it is always shown **next to** the
 * language code, never instead of it, and is hidden from assistive technology.
 * Emoji flags are deliberately not used — Windows does not render them.
 *
 * The chosen countries are conventional shorthands for the three locales:
 * France (fr), Germany (de), United Kingdom (en, the site uses en-GB).
 */
export function Flag({ locale, className = '' }: { locale: Locale; className?: string }) {
  const id = useId()

  const shared = {
    viewBox: '0 0 60 40',
    'aria-hidden': true as const,
    focusable: 'false' as const,
    className: `h-3.5 w-5 shrink-0 rounded-[2px] border border-black/10 object-cover ${className}`,
  }

  if (locale === 'fr') {
    return (
      <svg {...shared}>
        <rect width="20" height="40" fill="#002654" />
        <rect x="20" width="20" height="40" fill="#ffffff" />
        <rect x="40" width="20" height="40" fill="#ed2939" />
      </svg>
    )
  }

  if (locale === 'de') {
    return (
      <svg {...shared}>
        <rect width="60" height="13.33" fill="#000000" />
        <rect y="13.33" width="60" height="13.33" fill="#dd0000" />
        <rect y="26.66" width="60" height="13.34" fill="#ffce00" />
      </svg>
    )
  }

  // United Kingdom — simplified Union Jack, geometry clipped per instance.
  const clipId = `rk-flag-uk-${id}`
  return (
    <svg {...shared}>
      <clipPath id={clipId}>
        <path d="M30,20 h30 v20 z v20 h-30 z h-30 v-20 z v-20 h30 z" />
      </clipPath>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#ffffff" strokeWidth="8" />
      <path
        d="M0,0 L60,40 M60,0 L0,40"
        clipPath={`url(#${clipId})`}
        stroke="#c8102e"
        strokeWidth="5"
      />
      <path d="M30,0 v40 M0,20 h60" stroke="#ffffff" strokeWidth="13" />
      <path d="M30,0 v40 M0,20 h60" stroke="#c8102e" strokeWidth="8" />
    </svg>
  )
}
