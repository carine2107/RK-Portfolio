'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useSyncExternalStore } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { Flag } from '@/components/i18n/Flag'
import { usePathname } from '@/i18n/navigation'
import { localeDisplayOrder, type Locale } from '@/i18n/routing'

/**
 * `FR | DE | EN` switcher, each language prefixed by its flag.
 *
 * The flag never stands alone: the language code stays next to it, so nothing
 * is conveyed by an image (or by colour) only.
 *
 * Targets are read from the `<link rel="alternate" hreflang="…">` tags that
 * every page emits for SEO, so switching language always lands on the
 * *equivalent* page even when the slug is translated
 * (`/fr/insights/lire-un-bilan…` → `/de/insights/eine-bilanz-lesen…`), with a
 * single source of truth. The document head is subscribed to as an external
 * store, so the links follow client-side navigations.
 *
 * Until the alternates are read (server rendering, or a click made before
 * hydration), the link keeps the current path and only swaps the locale prefix
 * — correct for every page whose slug is not translated, and never a dead end.
 */
function subscribeHead(callback: () => void): () => void {
  const observer = new MutationObserver(callback)
  observer.observe(document.head, { childList: true, subtree: true, attributes: true })
  return () => observer.disconnect()
}

function readAlternates(): string {
  return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'))
    .map((link) => `${link.hreflang}|${new URL(link.href, window.location.origin).pathname}`)
    .join(';')
}

function serverAlternates(): string {
  return ''
}

export function LanguageSwitcher({
  className = '',
  tone = 'default',
}: {
  className?: string
  tone?: 'default' | 'contrast'
}) {
  const contrast = tone === 'contrast'
  const active = useLocale() as Locale
  const t = useTranslations('language')
  const pathname = usePathname()
  const serialized = useSyncExternalStore(subscribeHead, readAlternates, serverAlternates)

  const hrefs = useMemo(() => {
    const map: Partial<Record<Locale, string>> = {}
    for (const entry of serialized.split(';')) {
      const [code, path] = entry.split('|')
      if (code && path && (localeDisplayOrder as readonly string[]).includes(code)) {
        map[code as Locale] = path
      }
    }
    return map
  }, [serialized])

  const fallbackHref = (locale: Locale) => `/${locale}${pathname === '/' ? '' : pathname}`

  return (
    <div className={`flex items-center ${className}`} data-testid="language-switcher">
      <span id="rk-language-label" className="sr-only">
        {t('label')}
      </span>
      <ul aria-labelledby="rk-language-label" className="flex items-center text-sm">
        {localeDisplayOrder.map((locale, index) => {
          const isActive = locale === active
          const label = t(`short${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'shortFr')
          return (
            <li key={locale} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`px-px ${contrast ? 'text-line-contrast' : 'text-line-strong'}`}
                >
                  |
                </span>
              ) : null}
              {isActive ? (
                <span
                  aria-current="true"
                  data-locale={locale}
                  className={`inline-flex items-center gap-1.5 rounded px-1 py-1 font-semibold ${
                    contrast ? 'text-on-contrast' : 'text-primary'
                  }`}
                  lang={locale}
                >
                  <Flag locale={locale} />
                  {label}
                </span>
              ) : (
                <a
                  href={hrefs[locale] ?? fallbackHref(locale)}
                  hrefLang={locale}
                  lang={locale}
                  data-locale={locale}
                  aria-label={`${label} — ${t('switchTo', { language: t(locale) })}`}
                  onClick={() => trackEvent('language_change', { from: active, to: locale })}
                  className={`inline-flex items-center gap-1.5 rounded px-1 py-1 underline-offset-4 transition-colors hover:underline ${
                    contrast
                      ? 'text-on-contrast-secondary hover:text-accent'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <Flag locale={locale} className="opacity-90 transition-opacity" />
                  {label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
