'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import type { NewsletterResponse } from '@/lib/newsletter-schema'

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * RK Insights sign-up form (double opt-in). `tone="contrast"` for the dark
 * footer band. The success message only promises a confirmation e-mail.
 */
export function NewsletterForm({
  privacyHref,
  source,
  tone = 'surface',
}: {
  privacyHref: string
  source: string
  tone?: 'surface' | 'contrast'
}) {
  const t = useTranslations('newsletter')
  const locale = useLocale()
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const onContrast = tone === 'contrast'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      email: String(data.get('email') ?? ''),
      consent: data.get('consent') === 'on',
      company: String(data.get('company') ?? ''),
      locale,
      source,
    }

    // Loaded on submit only: the validation library stays out of every page load.
    const { newsletterSchema } = await import('@/lib/newsletter-schema')
    const parsed = newsletterSchema.safeParse(payload)
    if (!parsed.success) {
      const field = parsed.error.issues.find((issue) => issue.path[0] === 'email')
        ? 'email'
        : 'consent'
      setError(t(`errors.${field}`))
      setStatus('error')
      return
    }

    setStatus('submitting')
    setError(null)
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await response.json()) as NewsletterResponse
      if (body.ok) {
        setStatus('success')
        trackEvent('newsletter_subscribe', { source })
        form.reset()
        return
      }
      const reason = body.errors?.email
        ? 'email'
        : body.errors?.consent
          ? 'consent'
          : (body.reason ?? 'server')
      setError(t(`errors.${reason}`))
      setStatus('error')
    } catch {
      setError(t('errors.server'))
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className={[
          'rounded-card border p-5',
          onContrast
            ? 'border-line-contrast bg-contrast-raised text-on-contrast'
            : 'border-success-line bg-success-surface text-success-text',
        ].join(' ')}
      >
        <p className="font-semibold">{t('success.title')}</p>
        <p className={`mt-1 text-sm ${onContrast ? 'text-on-contrast-secondary' : ''}`}>
          {t('success.body')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          {t('emailLabel')}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
          aria-invalid={status === 'error' ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'min-h-12 w-full flex-1 rounded-full border px-5 text-base',
            onContrast
              ? 'border-line-contrast bg-contrast-raised text-on-contrast placeholder:text-on-contrast-secondary'
              : 'border-line-strong bg-surface text-primary placeholder:text-secondary',
          ].join(' ')}
        />
        <Button
          type="submit"
          variant={onContrast ? 'accent' : 'primary'}
          loading={status === 'submitting'}
          className="min-h-12 shrink-0"
        >
          {status === 'submitting' ? t('submitting') : t('submit')}
        </Button>
      </div>

      {/* Honeypot — hidden from humans and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-start gap-3">
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 size-6 shrink-0 rounded border-line-strong accent-[var(--accent)]"
        />
        <label
          htmlFor={`${id}-consent`}
          className={`text-sm leading-relaxed ${onContrast ? 'text-on-contrast-secondary' : 'text-secondary'}`}
        >
          {t.rich('consent', {
            link: (chunks) => (
              <Link
                href={privacyHref}
                className={`underline underline-offset-4 ${onContrast ? 'text-accent' : 'text-accent-text'}`}
              >
                {chunks}
              </Link>
            ),
          })}
        </label>
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={`text-sm ${onContrast ? 'text-on-contrast' : 'text-error-text'}`}
        >
          {error}
        </p>
      ) : null}
    </form>
  )
}
