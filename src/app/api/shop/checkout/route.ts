import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { contactRateLimit } from '@/lib/env'
import { checkRateLimit, clientKey } from '@/lib/rate-limit'
import {
  createPendingOrder,
  quoteCart,
  startPaypalCheckout,
  startStripeCheckout,
  type Provider,
} from '@/lib/shop'
import { paypalReady, stripeReady } from '@/lib/shop-config'
import { parseCustomer } from '@/lib/shop-customer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Starts a payment: prices the cart from the CMS, checks the customer's details,
 * creates a pending order and returns the provider's hosted payment page.
 * Nothing is charged here.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const key = createHash('sha256')
    .update(`checkout:${clientKey(request.headers)}`)
    .digest('hex')
    .slice(0, 32)
  const limit = checkRateLimit(key, contactRateLimit.max, contactRateLimit.windowMs)
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, reason: 'rateLimit' }, { status: 429 })
  }

  let body: {
    lines?: unknown
    locale?: unknown
    provider?: unknown
    acceptTerms?: unknown
    acceptDigitalWaiver?: unknown
    customer?: unknown
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 400 })
  }

  const provider: Provider | null =
    body.provider === 'stripe' || body.provider === 'paypal' ? body.provider : null
  const locale =
    typeof body.locale === 'string' && isLocale(body.locale) ? body.locale : defaultLocale

  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 })

  const { priced, settings } = await quoteCart(cms, body.lines, locale)
  const providerReady =
    provider === 'stripe' ? stripeReady() : provider === 'paypal' ? paypalReady() : false
  if (!settings.enabled || !providerReady) {
    return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 })
  }
  if (body.acceptTerms !== true) {
    return NextResponse.json({ ok: false, reason: 'terms' }, { status: 422 })
  }
  if (priced.hasDigital && body.acceptDigitalWaiver !== true) {
    return NextResponse.json({ ok: false, reason: 'waiver' }, { status: 422 })
  }
  const customer = parseCustomer(body.customer, priced.requiresShipping)
  if (!customer.ok) {
    return NextResponse.json(
      { ok: false, reason: 'customer', errors: customer.errors },
      { status: 422 },
    )
  }
  if (priced.removed.length > 0 || priced.items.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        reason: priced.items.length === 0 ? 'empty' : 'changed',
        removed: priced.removed,
      },
      { status: 409 },
    )
  }

  try {
    const order = await createPendingOrder(cms, priced, {
      locale,
      provider: provider as Provider,
      customer: customer.customer,
    })
    const url =
      provider === 'stripe'
        ? await startStripeCheckout(cms, order, priced, locale, customer.customer)
        : await startPaypalCheckout(cms, order, priced, locale, customer.customer)
    return NextResponse.json({ ok: true, url })
  } catch (error) {
    console.error(
      `[shop] Checkout could not start (${provider}):`,
      error instanceof Error ? error.message : 'unknown error',
    )
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 502 })
  }
}
