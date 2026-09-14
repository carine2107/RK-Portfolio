'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { clearCart } from '@/components/shop/cart-store'
import { buttonClasses } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'

type State = { status: 'loading' | 'paid' | 'pending' | 'unknown'; number?: string }

const noSubscribe = () => () => {}
const readRef = () => new URLSearchParams(window.location.search).get('ref') ?? ''

/**
 * Confirmation after payment. The payment is confirmed by the provider's
 * webhook, which can arrive a few seconds after the redirect: the status is
 * polled for up to half a minute before saying it is still being processed.
 */
export function CheckoutSuccess() {
  const t = useTranslations('shop.success')
  const reference = useSyncExternalStore(noSubscribe, readRef, () => null)
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (reference === null) return
    let cancelled = false
    let attempts = 0

    const check = () => {
      fetch(`/api/shop/order?ref=${encodeURIComponent(reference)}`)
        .then(
          (response) =>
            response.json() as Promise<{ ok: boolean; number?: string; status?: string }>,
        )
        .then((body) => {
          if (cancelled) return
          if (!body.ok) {
            setState({ status: 'unknown' })
            return
          }
          if (body.status === 'paid' || body.status === 'shipped') {
            clearCart()
            setState({ status: 'paid', number: body.number })
            return
          }
          attempts += 1
          if (attempts >= 15) {
            setState({ status: 'pending', number: body.number })
            return
          }
          setTimeout(check, 2000)
        })
        .catch(() => {
          if (!cancelled) setState({ status: 'unknown' })
        })
    }
    check()
    return () => {
      cancelled = true
    }
  }, [reference])

  const message =
    state.status === 'paid'
      ? t('paid', { number: state.number ?? '' })
      : state.status === 'pending'
        ? t('pending', { number: state.number ?? '' })
        : state.status === 'unknown'
          ? t('unknown')
          : t('checking')

  return (
    <div role="status" aria-live="polite" className="max-w-xl">
      <p className="text-lg text-primary">{message}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/books" className={buttonClasses('primary')}>
          {t('back')}
        </Link>
        {state.status === 'unknown' || state.status === 'pending' ? (
          <Link href="/contact" className={buttonClasses('secondary')}>
            {t('contact')}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
