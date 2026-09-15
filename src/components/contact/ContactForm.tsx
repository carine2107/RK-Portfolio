'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import { countryOptions } from '@/lib/countries'
import type { ContactFieldErrors, ContactResponse } from '@/lib/contact-schema'
import { BUDGETS, DECISION_ROLES, ORGANISATION_TYPES, TIMELINES } from '@/lib/lead-score'
import { REQUEST_TYPES } from '@/payload/collections/ContactSubmissions'

type Status = 'idle' | 'submitting' | 'success' | 'successNoEmail' | 'error'

const QUALIFICATION_QUESTIONS = [
  ['organisationType', ORGANISATION_TYPES],
  ['budget', BUDGETS],
  ['timeline', TIMELINES],
  ['decisionRole', DECISION_ROLES],
] as const

export function ContactForm({
  privacyHref,
  bookingUrl = '',
}: {
  privacyHref: string
  /** External booking page, offered after a priority request when configured. */
  bookingUrl?: string
}) {
  const t = useTranslations('contact')
  const common = useTranslations('common')
  const locale = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const [errors, setErrors] = useState<ContactFieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverReason, setServerReason] = useState<'rateLimit' | 'server' | null>(null)
  const [suggestBooking, setSuggestBooking] = useState(false)

  const countries = useMemo(() => countryOptions(locale), [locale])

  // "/contact?type=speaking" preselects the request type (links from the
  // Speaking & Media pages); "&subject=…" prefills an empty subject (order link of
  // a book page). Read after hydration so the page stays static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    const select = formRef.current?.elements.namedItem('requestType')
    if (
      type &&
      select instanceof HTMLSelectElement &&
      REQUEST_TYPES.some((value) => value === type)
    ) {
      select.value = type
    }
    const subject = params.get('subject')?.trim().slice(0, 200)
    const subjectField = formRef.current?.elements.namedItem('subject')
    if (subject && subjectField instanceof HTMLInputElement && !subjectField.value) {
      subjectField.value = subject
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get('name') ?? ''),
      organisation: String(formData.get('organisation') ?? ''),
      email: String(formData.get('email') ?? ''),
      country: String(formData.get('country') ?? ''),
      requestType: String(formData.get('requestType') ?? ''),
      subject: String(formData.get('subject') ?? ''),
      message: String(formData.get('message') ?? ''),
      organisationType: String(formData.get('organisationType') ?? ''),
      budget: String(formData.get('budget') ?? ''),
      timeline: String(formData.get('timeline') ?? ''),
      decisionRole: String(formData.get('decisionRole') ?? ''),
      consent: formData.get('consent') === 'on',
      company: String(formData.get('company') ?? ''),
      locale,
    }

    // Client-side validation first: the same schema runs again on the server.
    // Loaded on submit only, so the validation library is not part of the page load.
    const { contactSchema, toFieldErrors } = await import('@/lib/contact-schema')
    const parsed = contactSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error)
      setErrors(fieldErrors)
      setStatus('error')
      window.requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setErrors({})
    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const result = (await response.json()) as ContactResponse

      if (result.ok) {
        setSuggestBooking(Boolean(result.suggestBooking && bookingUrl))
        setStatus(result.emailSent ? 'success' : 'successNoEmail')
        trackEvent('contact_form_success', { requestType: payload.requestType })
        formRef.current?.reset()
        return
      }

      if (result.errors) {
        setErrors(result.errors)
        setStatus('error')
        window.requestAnimationFrame(() => summaryRef.current?.focus())
        return
      }

      setErrors({})
      setStatus('error')
      setServerReason(result.reason ?? 'server')
      window.requestAnimationFrame(() => summaryRef.current?.focus())
    } catch {
      setErrors({})
      setServerReason('server')
      setStatus('error')
    }
  }

  const errorEntries = Object.entries(errors) as [keyof ContactFieldErrors, string][]

  if (status === 'success' || status === 'successNoEmail') {
    const key = status === 'success' ? 'success' : 'successNoEmail'
    return (
      <Notice tone="success" role="status" title={t(`${key}.title`)} className="text-base">
        <p className="mt-1">{t(`${key}.body`)}</p>
        {suggestBooking ? (
          <div className="mt-4 border-t border-success-line pt-4">
            <p>{t('successBooking')}</p>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('booking_click', { location: 'contact_success' })}
              className="mt-3 inline-flex min-h-11 items-center font-medium underline underline-offset-4"
            >
              {t('booking.cta')}
            </a>
          </div>
        ) : null}
      </Notice>
    )
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
      <div
        ref={summaryRef}
        tabIndex={-1}
        role={errorEntries.length > 0 || serverReason ? 'alert' : undefined}
        className="focus:outline-none"
      >
        {errorEntries.length > 0 ? (
          <Notice tone="error" title={t('errors.summaryTitle', { count: errorEntries.length })}>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errorEntries.map(([field, key]) => (
                <li key={field}>
                  <a href={`#contact-${field}`} className="underline underline-offset-4">
                    {t(`errors.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </Notice>
        ) : null}

        {serverReason && errorEntries.length === 0 ? (
          <Notice tone="error">{t(`errors.${serverReason}`)}</Notice>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="name"
          label={t('fields.name')}
          placeholder={t('placeholders.name')}
          autoComplete="name"
          required
          error={errors.name ? t(`errors.${errors.name}`) : undefined}
        />
        <TextField
          name="organisation"
          label={t('fields.organisation')}
          placeholder={t('placeholders.organisation')}
          autoComplete="organization"
          optionalLabel={common('optional')}
          error={errors.organisation ? t(`errors.${errors.organisation}`) : undefined}
        />
        <TextField
          name="email"
          type="email"
          label={t('fields.email')}
          placeholder={t('placeholders.email')}
          autoComplete="email"
          required
          error={errors.email ? t(`errors.${errors.email}`) : undefined}
        />

        <SelectField
          name="country"
          label={t('fields.country')}
          required
          error={errors.country ? t(`errors.${errors.country}`) : undefined}
        >
          <option value="">{t('placeholders.country')}</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          name="requestType"
          label={t('fields.requestType')}
          required
          className="sm:col-span-2"
          error={errors.requestType ? t(`errors.${errors.requestType}`) : undefined}
        >
          <option value="">{t('placeholders.requestType')}</option>
          {REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`requestTypes.${type}`)}
            </option>
          ))}
        </SelectField>

        <TextField
          name="subject"
          label={t('fields.subject')}
          placeholder={t('placeholders.subject')}
          required
          className="sm:col-span-2"
          error={errors.subject ? t(`errors.${errors.subject}`) : undefined}
        />
      </div>

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-sm font-semibold text-primary">
          {t('qualification.title')}
        </legend>
        <p className="mb-5 text-sm text-secondary">{t('qualification.hint')}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {QUALIFICATION_QUESTIONS.map(([name, values]) => (
            <SelectField
              key={name}
              name={name}
              label={t(`fields.${name}`)}
              optionalLabel={common('optional')}
              error={errors[name] ? t(`errors.${errors[name]}`) : undefined}
            >
              <option value="">{t('placeholders.choose')}</option>
              {values.map((value) => (
                <option key={value} value={value}>
                  {t(`options.${name}.${value}`)}
                </option>
              ))}
            </SelectField>
          ))}
        </div>
      </fieldset>

      <div>
        <FieldLabel htmlFor="contact-message" label={t('fields.message')} required />
        <textarea
          id="contact-message"
          name="message"
          rows={7}
          required
          placeholder={t('placeholders.message')}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={fieldClasses(Boolean(errors.message))}
        />
        {errors.message ? (
          <FieldError id="contact-message-error">{t(`errors.${errors.message}`)}</FieldError>
        ) : null}
      </div>

      {/* Honeypot — hidden from humans and from screen readers, never focusable. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="contact-consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
            className="mt-0.5 size-6 shrink-0 rounded border-line-strong accent-[var(--surface-inverse)]"
          />
          <label htmlFor="contact-consent" className="text-sm leading-relaxed text-secondary">
            {t.rich('fields.consent', {
              link: (chunks) => (
                <Link href={privacyHref} className="text-accent-text underline underline-offset-4">
                  {chunks}
                </Link>
              ),
            })}
          </label>
        </div>
        {errors.consent ? (
          <FieldError id="contact-consent-error">{t(`errors.${errors.consent}`)}</FieldError>
        ) : null}
      </div>

      <p className="text-sm text-secondary">{t('privacyNote')}</p>

      <Button type="submit" size="lg" loading={status === 'submitting'}>
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}

function fieldClasses(hasError: boolean): string {
  return [
    'w-full rounded-card border bg-surface px-4 py-3 text-base text-primary placeholder:text-secondary',
    'min-h-12 transition-colors',
    hasError ? 'border-error-line' : 'border-line-strong focus:border-line-accent',
  ].join(' ')
}

function FieldLabel({
  htmlFor,
  label,
  required,
  optionalLabel,
}: {
  htmlFor: string
  label: string
  required?: boolean
  optionalLabel?: string
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-primary">
      {label}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-accent-text">
          *
        </span>
      ) : optionalLabel ? (
        <span className="ml-2 text-xs font-normal text-secondary">({optionalLabel})</span>
      ) : null}
    </label>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-sm text-error-text">
      {children}
    </p>
  )
}

function TextField({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required,
  error,
  className = '',
  optionalLabel,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  error?: string
  className?: string
  optionalLabel?: string
}) {
  const id = `contact-${name}`
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} optionalLabel={optionalLabel} />
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClasses(Boolean(error))}
      />
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  )
}

function SelectField({
  name,
  label,
  required,
  error,
  children,
  className = '',
  optionalLabel,
}: {
  name: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
  optionalLabel?: string
}) {
  const id = `contact-${name}`
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} optionalLabel={optionalLabel} />
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClasses(Boolean(error))}
      >
        {children}
      </select>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  )
}
