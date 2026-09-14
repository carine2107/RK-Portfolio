import { NextResponse } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { quoteCart } from '@/lib/shop'
import { paymentsReady, paypalReady, stripeReady } from '@/lib/shop-config'
import { fromMinor } from '@/lib/shop-pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Prices a cart from the CMS and says whether (and how) it can be paid. */
export async function POST(request: Request): Promise<NextResponse> {
  let body: { lines?: unknown; locale?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const locale =
    typeof body.locale === 'string' && isLocale(body.locale) ? body.locale : defaultLocale

  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false }, { status: 503 })

  const { priced, settings } = await quoteCart(cms, body.lines, locale)
  return NextResponse.json(
    {
      ok: true,
      active: settings.enabled && paymentsReady(),
      providers: {
        stripe: settings.enabled && stripeReady(),
        paypal: settings.enabled && paypalReady(),
      },
      items: priced.items.map((item) => ({
        bookId: item.bookId,
        kind: item.kind,
        title: item.title,
        quantity: item.quantity,
        unitPrice: fromMinor(item.unitAmount),
        lineTotal: fromMinor(item.lineAmount),
      })),
      total: fromMinor(priced.totalAmount),
      vatRate: priced.vatRate,
      vatAmount: fromMinor(priced.vatAmount),
      currency: priced.currency,
      removed: priced.removed,
      requiresShipping: priced.requiresShipping,
      hasDigital: priced.hasDigital,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
