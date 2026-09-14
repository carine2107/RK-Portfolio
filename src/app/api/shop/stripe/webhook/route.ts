import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { handleStripeEvent } from '@/lib/shop'
import { stripeConfig } from '@/lib/shop-config'
import { parseStripeEvent } from '@/lib/stripe-webhook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Stripe webhook: the only way a Stripe order becomes "paid". The signature is
 * checked against STRIPE_WEBHOOK_SECRET on the raw body before anything else.
 * Subscribe the endpoint to checkout.session.completed,
 * checkout.session.async_payment_succeeded and checkout.session.expired.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!stripeConfig.webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  const body = await request.text()
  const event = parseStripeEvent(
    body,
    request.headers.get('stripe-signature'),
    stripeConfig.webhookSecret,
  )
  if (!event) return NextResponse.json({ ok: false }, { status: 400 })

  const cms = await getCms()
  // 5xx: Stripe retries the event later.
  if (!cms) return NextResponse.json({ ok: false }, { status: 503 })

  try {
    const result = await handleStripeEvent(cms, event)
    return NextResponse.json({ received: true, result })
  } catch (error) {
    console.error(
      '[shop] Stripe event failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
