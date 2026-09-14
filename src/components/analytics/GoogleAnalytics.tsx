'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import {
  clearAnalyticsCookies,
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from '@/lib/consent'

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
} & Record<string, unknown>

const storage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Loads gtag.js once, only after consent. */
function loadGoogleAnalytics(measurementId: string) {
  const w = window as unknown as GtagWindow
  w[`ga-disable-${measurementId}`] = false
  if (document.getElementById('rk-gtag')) return

  w.dataLayer = w.dataLayer ?? []
  w.gtag = function gtag() {
    // gtag.js expects the `arguments` object itself.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  w.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  w.gtag('js', new Date())
  w.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })

  const script = document.createElement('script')
  script.id = 'rk-gtag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)
}

/** Stops measurement at once and removes the cookies already set. */
function stopGoogleAnalytics(measurementId: string) {
  const w = window as unknown as GtagWindow
  w[`ga-disable-${measurementId}`] = true
  w.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  clearAnalyticsCookies(document, window.location.hostname)
}

/**
 * Consent banner + Google Analytics 4. Nothing from Google is requested before
 * the visitor accepts; refusing is as easy as accepting; the choice can be
 * changed at any time from the footer ("Cookie settings").
 */
export function GoogleAnalytics({
  measurementId,
  cookiesHref,
}: {
  measurementId: string
  cookiesHref: string
}) {
  const t = useTranslations('consent')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const choice = readConsent(storage())
    if (choice === 'granted') loadGoogleAnalytics(measurementId)
    // Shown after hydration only: a returning visitor never sees a flash.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (choice === null) setOpen(true)

    const reopen = () => setOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
  }, [measurementId])

  const decide = useCallback(
    (choice: ConsentChoice) => {
      writeConsent(storage(), choice)
      if (choice === 'granted') loadGoogleAnalytics(measurementId)
      else stopGoogleAnalytics(measurementId)
      setOpen(false)
    },
    [measurementId],
  )

  if (!open) return null

  return (
    <section
      aria-labelledby="rk-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6"
    >
      <div className="mx-auto max-w-3xl rounded-card border border-line bg-surface-raised p-5 text-primary shadow-float md:p-6">
        <h2 id="rk-consent-title" className="font-serif text-lg">
          {t('title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          {t.rich('body', {
            link: (chunks) => (
              <Link href={cookiesHref} className="text-accent-text underline underline-offset-4">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => decide('denied')}>
            {t('refuse')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => decide('granted')}>
            {t('accept')}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** Footer button reopening the consent banner. */
export function ConsentSettingsButton({ className = '' }: { className?: string }) {
  const t = useTranslations('consent')
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className={className}
    >
      {t('settings')}
    </button>
  )
}
