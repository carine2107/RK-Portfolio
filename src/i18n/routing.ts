import { defineRouting } from 'next-intl/routing'

/**
 * Supported locales. `en` is the documented default: the brand positioning is
 * international ("Europe – Africa – International") and the headline is English.
 * Visitors are still redirected to their preferred language when their browser
 * announces `fr` or `de` (see `localeDetection` below).
 */
export const locales = ['en', 'fr', 'de'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Order used by the `FR | DE | EN` switcher required by the specification. */
export const localeDisplayOrder: readonly Locale[] = ['fr', 'de', 'en'] as const

export const localeHtmlLang: Record<Locale, string> = {
  en: 'en',
  fr: 'fr',
  de: 'de',
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every URL carries its locale (`/en/...`, `/fr/...`, `/de/...`) so that
  // canonical URLs and hreflang alternates are unambiguous.
  localePrefix: 'always',
  localeDetection: true,
  localeCookie: {
    name: 'RK_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
})

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
