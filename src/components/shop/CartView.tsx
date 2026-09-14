'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useState, useSyncExternalStore } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { cartCount, removeFromCart, setCartQuantity, useCart } from '@/components/shop/cart-store'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
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

const noSubscribe = () => () => {}
const readSearch = () => window.location.search

/** Cart page: server-priced lines, terms acceptance and the payment buttons. */
export function CartView({ termsHref, returnsHref }: { termsHref: string; returnsHref: string }) {
  const t = useTranslations('shop.cart')
  const locale = useLocale()
  const id = useId()
  const lines = useCart()
  const search = useSyncExternalStore(noSubscribe, readSearch, () => '')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [waived, setWaived] = useState(false)
  const [busy, setBusy] = useState<'stripe' | 'paypal' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [removedNotice, setRemovedNotice] = useState(false)

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

  const pay = async (provider: 'stripe' | 'paypal') => {
    if (!accepted) {
      setError(t('errors.terms'))
      return
    }
    if (quote?.hasDigital && !waived) {
      setError(t('errors.waiver'))
      return
    }
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
          acceptTerms: true,
          acceptDigitalWaiver: waived,
        }),
      })
      const body = (await response.json()) as {
        ok: boolean
        url?: string
        reason?: string
        removed?: string[]
      }
      if (body.ok && body.url) {
        window.location.assign(body.url)
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
      setError(t('errors.server'))
    }
    setBusy(null)
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

  return (
    <div className="grid gap-10 lg:grid-cols-12">
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
                    onChange={(event) => setCartQuantity(item.bookId, Number(event.target.value))}
                    className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-primary"
                  >
                    {Array.from({ length: MAX_QUANTITY }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <p className="w-24 text-right font-medium text-primary">{format(item.lineTotal)}</p>
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

      <aside className="h-fit rounded-card border border-line bg-surface-subtle p-6 lg:col-span-5">
        <dl className="space-y-3 text-sm">
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
        <p className="mt-2 text-xs text-secondary">
          {t('itemsCount', { count: cartCount(lines) })}
        </p>

        {quote.active ? (
          <div className="mt-6 space-y-4">
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
                <label htmlFor={`${id}-waiver`} className="text-sm leading-relaxed text-secondary">
                  {t('waiver')}
                </label>
              </div>
            ) : null}

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
          <Notice tone="warning" className="mt-6">
            {t('unavailable')}
          </Notice>
        )}
      </aside>
    </div>
  )
}
