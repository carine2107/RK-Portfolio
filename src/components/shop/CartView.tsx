'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { cartCount, removeFromCart, setCartQuantity, useCart } from '@/components/shop/cart-store'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import { countryName, countryOptions } from '@/lib/countries'
import {
  CUSTOMER_FIELDS,
  EMPTY_CUSTOMER,
  NO_SHIPPING,
  parseCustomer,
  type CustomerDetails,
  type CustomerErrors,
  type CustomerField,
} from '@/lib/shop-customer'
import { MAX_QUANTITY } from '@/lib/shop-pricing'

type Quote = {
  ok: boolean
  active: boolean
  providers: { stripe: boolean; paypal: boolean }
  items: {
    bookId: string
    kind: 'book' | 'product'
    title: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
  total: number
  vatRate: number
  vatAmount: number
  currency: string
  removed: string[]
  requiresShipping: boolean
  hasDigital: boolean
}

type Step = 'cart' | 'details' | 'payment'

const STEPS: Step[] = ['cart', 'details', 'payment']

/** Details typed in this tab are kept until it is closed (e.g. back from a cancelled payment). */
const DETAILS_KEY = 'rk-checkout-details'

function readDetails(): CustomerDetails {
  if (typeof window === 'undefined') return EMPTY_CUSTOMER
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(DETAILS_KEY) ?? '{}') as Record<
      string,
      unknown
    >
    const details = { ...EMPTY_CUSTOMER }
    for (const field of CUSTOMER_FIELDS) {
      const value = stored[field]
      if (typeof value === 'string') details[field] = value.slice(0, 254)
    }
    return details
  } catch {
    return EMPTY_CUSTOMER
  }
}

function saveDetails(details: CustomerDetails): void {
  try {
    window.sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details))
  } catch {
    /* storage unavailable: the details are simply not remembered */
  }
}

const noSubscribe = () => () => {}
const readSearch = () => window.location.search

const AUTOCOMPLETE: Record<CustomerField, string> = {
  email: 'email',
  name: 'name',
  line1: 'address-line1',
  line2: 'address-line2',
  postalCode: 'postal-code',
  city: 'address-level2',
  country: 'country',
}

/**
 * Cart page in three steps: the server-priced cart, the customer's details
 * (contact and delivery address), then the payment options. Payment buttons only
 * appear when the shop is open and a provider is configured.
 */
export function CartView({ termsHref, returnsHref }: { termsHref: string; returnsHref: string }) {
  const t = useTranslations('shop.cart')
  const locale = useLocale()
  const id = useId()
  const lines = useCart()
  const search = useSyncExternalStore(noSubscribe, readSearch, () => '')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [step, setStep] = useState<Step>('cart')
  // Only rendered after a click on "Pay now", so reading storage here cannot
  // change the server-rendered markup.
  const [details, setDetails] = useState<CustomerDetails>(readDetails)
  const [fieldErrors, setFieldErrors] = useState<CustomerErrors>({})
  const [accepted, setAccepted] = useState(false)
  const [waived, setWaived] = useState(false)
  const [busy, setBusy] = useState<'stripe' | 'paypal' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [removedNotice, setRemovedNotice] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorsRef = useRef<HTMLDivElement>(null)

  const countries = useMemo(
    () => countryOptions(locale).filter((country) => !NO_SHIPPING.has(country.code)),
    [locale],
  )

  const key = JSON.stringify(lines)
  useEffect(() => {
    if (lines.length === 0) return
    let cancelled = false
    fetch('/api/shop/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, locale }),
    })
      .then((response) => response.json() as Promise<Quote>)
      .then((body) => {
        if (cancelled) return
        setQuote(body)
        if (body.removed?.length) {
          removeFromCart(body.removed)
          setRemovedNotice(true)
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('errors.server'))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, locale])

  const format = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: quote?.currency ?? 'EUR' }).format(
      value,
    )

  const goTo = (next: Step) => {
    setStep(next)
    setError(null)
    window.requestAnimationFrame(() => headingRef.current?.focus())
  }

  const update = (field: CustomerField, value: string) => {
    setDetails((current) => {
      const next = { ...current, [field]: value }
      saveDetails(next)
      return next
    })
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const submitDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!quote) return
    const result = parseCustomer(details, quote.requiresShipping)
    if (!result.ok) {
      setFieldErrors(result.errors)
      setError(null)
      window.requestAnimationFrame(() => errorsRef.current?.focus())
      return
    }
    setFieldErrors({})
    if (!accepted) {
      setError(t('errors.terms'))
      return
    }
    if (quote.hasDigital && !waived) {
      setError(t('errors.waiver'))
      return
    }
    setDetails(result.customer)
    saveDetails(result.customer)
    goTo('payment')
  }

  const pay = async (provider: 'stripe' | 'paypal') => {
    setBusy(provider)
    setError(null)
    trackEvent('begin_checkout', { provider })
    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines,
          locale,
          provider,
          customer: details,
          acceptTerms: accepted,
          acceptDigitalWaiver: waived,
        }),
      })
      const body = (await response.json()) as {
        ok: boolean
        url?: string
        reason?: string
        removed?: string[]
        errors?: CustomerErrors
      }
      if (body.ok && body.url) {
        window.location.assign(body.url)
        return
      }
      setBusy(null)
      if (body.reason === 'customer') {
        setFieldErrors(body.errors ?? {})
        goTo('details')
        return
      }
      if (body.removed?.length) {
        removeFromCart(body.removed)
        setRemovedNotice(true)
      }
      const reason =
        body.reason === 'rateLimit' ||
        body.reason === 'unavailable' ||
        body.reason === 'terms' ||
        body.reason === 'waiver'
          ? body.reason
          : body.reason === 'changed' || body.reason === 'empty'
            ? 'changed'
            : 'server'
      setError(t(`errors.${reason}`))
    } catch {
      setBusy(null)
      setError(t('errors.server'))
    }
  }

  const params = new URLSearchParams(search)
  const banners = (
    <>
      {params.get('cancelled') ? <Notice tone="info">{t('cancelled')}</Notice> : null}
      {params.get('error') ? <Notice tone="error">{t('errors.payment')}</Notice> : null}
      {removedNotice ? <Notice tone="warning">{t('errors.changed')}</Notice> : null}
    </>
  )

  if (lines.length === 0) {
    return (
      <div className="space-y-6">
        {banners}
        <p className="text-lg text-secondary">{t('empty')}</p>
        <Link href="/books" className={buttonClasses('primary')}>
          {t('browse')}
        </Link>
      </div>
    )
  }

  if (!quote) {
    return (
      <p role="status" className="text-secondary">
        {error ?? t('loading')}
      </p>
    )
  }

  const stepIndex = STEPS.indexOf(step)
  const errorEntries = Object.entries(fieldErrors) as [CustomerField, 'required' | 'invalid'][]

  const fieldClasses = (field: CustomerField) =>
    [
      'min-h-12 w-full rounded-card border bg-surface px-4 py-3 text-base text-primary transition-colors',
      fieldErrors[field] ? 'border-error-line' : 'border-line-strong focus:border-line-accent',
    ].join(' ')

  const fieldLabel = (field: CustomerField, optional = false) => (
    <label htmlFor={`${id}-${field}`} className="mb-2 block text-sm font-medium text-primary">
      {t(`details.${field}`)}
      {optional ? (
        <span className="ml-2 text-xs font-normal text-secondary">({t('details.optional')})</span>
      ) : (
        <span aria-hidden="true" className="ml-1 text-accent-text">
          *
        </span>
      )}
    </label>
  )

  const fieldError = (field: CustomerField) =>
    fieldErrors[field] ? (
      <p id={`${id}-${field}-error`} className="mt-2 text-sm text-error-text">
        {t(`details.errors.${fieldErrors[field]}`, { field: t(`details.${field}`) })}
      </p>
    ) : null

  // A render function, not a component: inputs keep their focus while typing.
  const textField = (
    field: CustomerField,
    { type = 'text', optional = false, className = '' } = {},
  ) => (
    <div className={className}>
      {fieldLabel(field, optional)}
      <input
        id={`${id}-${field}`}
        name={field}
        type={type}
        value={details[field]}
        onChange={(event) => update(field, event.target.value)}
        autoComplete={AUTOCOMPLETE[field]}
        required={!optional}
        aria-invalid={fieldErrors[field] ? true : undefined}
        aria-describedby={fieldErrors[field] ? `${id}-${field}-error` : undefined}
        className={fieldClasses(field)}
      />
      {fieldError(field)}
    </div>
  )

  const stepHeading = (label: string) => (
    <h2
      ref={headingRef}
      tabIndex={-1}
      className="scroll-mt-28 font-serif text-2xl text-primary focus:outline-none"
    >
      {label}
    </h2>
  )

  const summary = (
    <aside className="h-fit rounded-card border border-line bg-surface-subtle p-6 lg:col-span-5">
      <dl className="space-y-3 text-sm">
        {step !== 'cart'
          ? quote.items.map((item) => (
              <div key={item.bookId} className="flex justify-between gap-4">
                <dt className="text-secondary">
                  <span lang="fr">{item.title}</span> × {item.quantity}
                </dt>
                <dd className="shrink-0 text-primary">{format(item.lineTotal)}</dd>
              </div>
            ))
          : null}
        {quote.requiresShipping ? (
          <div className="flex justify-between">
            <dt className="text-secondary">{t('shipping')}</dt>
            <dd className="text-primary">{t('freeShipping')}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt className="text-primary">{t('total')}</dt>
          <dd className="text-primary">{format(quote.total)}</dd>
        </div>
        {quote.vatRate > 0 ? (
          <div className="flex justify-between text-xs text-secondary">
            <dt>{t('vatIncluded', { rate: quote.vatRate })}</dt>
            <dd>{format(quote.vatAmount)}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-2 text-xs text-secondary">{t('itemsCount', { count: cartCount(lines) })}</p>

      {step === 'cart' ? (
        <div className="mt-6 space-y-4">
          {quote.active ? null : <Notice tone="warning">{t('unavailable')}</Notice>}
          <Button type="button" size="lg" className="w-full" onClick={() => goTo('details')}>
            {t('payNow')}
          </Button>
        </div>
      ) : null}
    </aside>
  )

  return (
    <div className="space-y-8">
      <nav aria-label={t('steps.label')}>
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {STEPS.map((entry, index) => (
            <li
              key={entry}
              aria-current={entry === step ? 'step' : undefined}
              className={`flex items-center gap-2 ${
                entry === step
                  ? 'font-semibold text-primary'
                  : index < stepIndex
                    ? 'text-primary'
                    : 'text-secondary'
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex size-7 items-center justify-center rounded-full border text-xs ${
                  entry === step
                    ? 'border-transparent bg-surface-inverse text-inverse'
                    : 'border-line-strong'
                }`}
              >
                {index + 1}
              </span>
              {t(`steps.${entry}`)}
              {index < STEPS.length - 1 ? (
                <span aria-hidden="true" className="ml-1 h-px w-6 bg-line-strong" />
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        {step === 'cart' ? (
          <div className="space-y-4 lg:col-span-7">
            {banners}
            <ul className="divide-y divide-line rounded-card border border-line">
              {quote.items.map((item) => (
                <li key={item.bookId} className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p lang="fr" className="font-medium text-primary">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-secondary">{format(item.unitPrice)}</p>
                  </div>
                  {item.kind === 'product' ? (
                    <p className="text-sm text-secondary">{t('single')}</p>
                  ) : (
                    <>
                      <label className="sr-only" htmlFor={`${id}-${item.bookId}`}>
                        {t('quantity')}
                      </label>
                      <select
                        id={`${id}-${item.bookId}`}
                        value={item.quantity}
                        onChange={(event) =>
                          setCartQuantity(item.bookId, Number(event.target.value))
                        }
                        className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-primary"
                      >
                        {Array.from({ length: MAX_QUANTITY }, (_, index) => index + 1).map(
                          (value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ),
                        )}
                      </select>
                    </>
                  )}
                  <p className="w-24 text-right font-medium text-primary">
                    {format(item.lineTotal)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart([item.bookId])}
                    className="min-h-11 text-sm text-secondary underline-offset-4 hover:text-error-text hover:underline"
                  >
                    {t('remove')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 'details' ? (
          <form onSubmit={submitDetails} noValidate className="space-y-6 lg:col-span-7">
            <div>
              {stepHeading(t('details.title'))}
              <p className="mt-2 text-sm text-secondary">
                {quote.requiresShipping ? t('details.intro') : t('details.introDigital')}
              </p>
            </div>

            <div ref={errorsRef} tabIndex={-1} className="focus:outline-none">
              {errorEntries.length > 0 ? (
                <Notice
                  tone="error"
                  role="alert"
                  title={t('details.errorsTitle', { count: errorEntries.length })}
                >
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errorEntries.map(([field, kind]) => (
                      <li key={field}>
                        <a href={`#${id}-${field}`} className="underline underline-offset-4">
                          {t(`details.errors.${kind}`, { field: t(`details.${field}`) })}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Notice>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {textField('name', { className: 'sm:col-span-2' })}
              {textField('email', { type: 'email', className: 'sm:col-span-2' })}
              {quote.requiresShipping ? (
                <>
                  {textField('line1', { className: 'sm:col-span-2' })}
                  {textField('line2', { optional: true, className: 'sm:col-span-2' })}
                  {textField('postalCode')}
                  {textField('city')}
                  <div className="sm:col-span-2">
                    {fieldLabel('country')}
                    <select
                      id={`${id}-country`}
                      name="country"
                      value={details.country}
                      onChange={(event) => update('country', event.target.value)}
                      autoComplete="country"
                      required
                      aria-invalid={fieldErrors.country ? true : undefined}
                      aria-describedby={fieldErrors.country ? `${id}-country-error` : undefined}
                      className={fieldClasses('country')}
                    >
                      <option value="">{t('details.countryPlaceholder')}</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    {fieldError('country')}
                  </div>
                </>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  id={`${id}-terms`}
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => {
                    setAccepted(event.target.checked)
                    setError(null)
                  }}
                  className="mt-0.5 size-6 shrink-0 rounded border-line-strong accent-[var(--surface-inverse)]"
                />
                <label htmlFor={`${id}-terms`} className="text-sm leading-relaxed text-secondary">
                  {t.rich('terms', {
                    terms: (chunks) => (
                      <Link
                        href={termsHref}
                        className="text-accent-text underline underline-offset-4"
                      >
                        {chunks}
                      </Link>
                    ),
                    returns: (chunks) => (
                      <Link
                        href={returnsHref}
                        className="text-accent-text underline underline-offset-4"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </label>
              </div>

              {quote.hasDigital ? (
                <div className="flex items-start gap-3">
                  <input
                    id={`${id}-waiver`}
                    type="checkbox"
                    checked={waived}
                    onChange={(event) => {
                      setWaived(event.target.checked)
                      setError(null)
                    }}
                    className="mt-0.5 size-6 shrink-0 rounded border-line-strong accent-[var(--surface-inverse)]"
                  />
                  <label
                    htmlFor={`${id}-waiver`}
                    className="text-sm leading-relaxed text-secondary"
                  >
                    {t('waiver')}
                  </label>
                </div>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="text-sm text-error-text">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => goTo('cart')}>
                {t('details.back')}
              </Button>
              <Button type="submit" size="lg">
                {t('payNow')}
              </Button>
            </div>
          </form>
        ) : null}

        {step === 'payment' ? (
          <div className="space-y-6 lg:col-span-7">
            {stepHeading(t('payment.title'))}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line p-5">
                <p className="text-xs font-semibold tracking-wide text-secondary uppercase">
                  {t('payment.contact')}
                </p>
                <p className="mt-2 text-primary">{details.name}</p>
                <p className="text-sm break-all text-secondary">{details.email}</p>
              </div>
              {quote.requiresShipping ? (
                <div className="rounded-card border border-line p-5">
                  <p className="text-xs font-semibold tracking-wide text-secondary uppercase">
                    {t('payment.delivery')}
                  </p>
                  <address className="mt-2 text-sm leading-relaxed text-primary not-italic">
                    {details.name}
                    <br />
                    {details.line1}
                    {details.line2 ? (
                      <>
                        <br />
                        {details.line2}
                      </>
                    ) : null}
                    <br />
                    {details.postalCode} {details.city}
                    <br />
                    {countryName(details.country, locale)}
                  </address>
                </div>
              ) : null}
            </div>
            <Button type="button" variant="ghost" onClick={() => goTo('details')}>
              {t('payment.edit')}
            </Button>

            {quote.active ? (
              <div className="space-y-3">
                <p className="text-sm text-secondary">{t('payment.choose')}</p>
                {error ? (
                  <p role="alert" className="text-sm text-error-text">
                    {error}
                  </p>
                ) : null}
                {quote.providers.stripe ? (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    loading={busy === 'stripe'}
                    disabled={busy !== null}
                    onClick={() => void pay('stripe')}
                  >
                    {t('payWithCard')}
                  </Button>
                ) : null}
                {quote.providers.paypal ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    className="w-full"
                    loading={busy === 'paypal'}
                    disabled={busy !== null}
                    onClick={() => void pay('paypal')}
                  >
                    {t('payWithPaypal')}
                  </Button>
                ) : null}
                <p className="text-xs text-secondary">
                  {quote.requiresShipping ? t('secureNote') : t('secureNoteDigital')}
                </p>
              </div>
            ) : (
              <Notice tone="warning">{t('unavailable')}</Notice>
            )}
          </div>
        ) : null}

        {summary}
      </div>
    </div>
  )
}
