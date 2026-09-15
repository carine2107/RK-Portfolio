'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { Flag } from '@/components/i18n/Flag'
import { usePathname } from '@/i18n/navigation'
import { localeDisplayOrder, type Locale } from '@/i18n/routing'

/**
 * Language switcher: a drop-down menu in the header, an inline `FR | DE | EN`
 * list in the footer. Each language is prefixed by its flag, which never stands
 * alone — the language code or name stays next to it.
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

/** Each language is offered under its own name, as visitors look for it. */
const NATIVE_NAMES: Record<Locale, string> = { fr: 'Français', de: 'Deutsch', en: 'English' }

function useLanguageTargets() {
  const active = useLocale() as Locale
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

  const hrefFor = (locale: Locale) =>
    hrefs[locale] ?? `/${locale}${pathname === '/' ? '' : pathname}`

  return { active, hrefFor }
}

type SwitcherProps = {
  className?: string
  tone?: 'default' | 'contrast'
  /** `dropdown` for the header and the mobile menu, `inline` for the footer. */
  variant?: 'inline' | 'dropdown'
  /** Where the drop-down list opens: below the button, or above it (mobile menu). */
  placement?: 'below' | 'above'
}

export function LanguageSwitcher({
  className = '',
  tone = 'default',
  variant = 'inline',
  placement = 'below',
}: SwitcherProps) {
  return variant === 'dropdown' ? (
    <LanguageDropdown className={className} placement={placement} />
  ) : (
    <LanguageList className={className} tone={tone} />
  )
}

function shortLabel(t: ReturnType<typeof useTranslations<'language'>>, locale: Locale): string {
  return t(`short${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'shortFr')
}

function LanguageDropdown({
  className,
  placement,
}: {
  className: string
  placement: 'below' | 'above'
}) {
  const { active, hrefFor } = useLanguageTargets()
  const t = useTranslations('language')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    // Captured before the mobile menu's own Escape handler: only the list closes.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      data-testid="language-switcher"
      className={`relative ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-3 text-sm font-medium text-primary transition-colors hover:border-line-accent"
      >
        <Flag locale={active} />
        {shortLabel(t, active)}
        <span className="sr-only"> — {t('label')}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`size-3.5 text-secondary transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        id={listId}
        hidden={!open}
        aria-label={t('label')}
        className={[
          'absolute z-50 min-w-44 rounded-card border border-line bg-surface-raised p-1.5 shadow-raised',
          placement === 'above' ? 'bottom-full left-0 mb-2' : 'top-full right-0 mt-2',
        ].join(' ')}
      >
        {localeDisplayOrder.map((locale) => {
          const isActive = locale === active
          return (
            <li key={locale}>
              <a
                href={hrefFor(locale)}
                hrefLang={locale}
                lang={locale}
                data-locale={locale}
                aria-current={isActive ? 'true' : undefined}
                onClick={(event) => {
                  if (isActive) {
                    event.preventDefault()
                    setOpen(false)
                    buttonRef.current?.focus()
                    return
                  }
                  trackEvent('language_change', { from: active, to: locale })
                }}
                className={[
                  'flex min-h-10 items-center gap-2.5 rounded-[0.5rem] px-3 py-2 text-sm transition-colors hover:bg-surface-subtle',
                  isActive ? 'font-semibold text-accent-text' : 'text-primary',
                ].join(' ')}
              >
                <Flag locale={locale} />
                {NATIVE_NAMES[locale]}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LanguageList({ className, tone }: { className: string; tone: 'default' | 'contrast' }) {
  const contrast = tone === 'contrast'
  const { active, hrefFor } = useLanguageTargets()
  const t = useTranslations('language')
  const labelId = useId()

  return (
    <div className={`flex items-center ${className}`} data-testid="language-switcher">
      <span id={labelId} className="sr-only">
        {t('label')}
      </span>
      <ul aria-labelledby={labelId} className="flex items-center text-sm">
        {localeDisplayOrder.map((locale, index) => {
          const isActive = locale === active
          const label = shortLabel(t, locale)
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
                  href={hrefFor(locale)}
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
