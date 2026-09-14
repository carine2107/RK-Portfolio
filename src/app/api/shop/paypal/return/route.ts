import { NextResponse } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { siteUrl } from '@/lib/env'
import { capturePaypalOrder, findOrderByReference } from '@/lib/shop'
import { paypalReady } from '@/lib/shop-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * PayPal sends the buyer back here after approval (`token` = PayPal order id).
 * The payment is captured server-side, then the buyer lands on the
 * confirmation page — or back on the cart if anything is not right.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  const reference = url.searchParams.get('ref')
  const paypalOrderId = url.searchParams.get('token')

  const cms = await getCms()
  const order = cms ? await findOrderByReference(cms, reference) : null
  const locale = order?.locale && isLocale(order.locale) ? order.locale : defaultLocale
  const failure = NextResponse.redirect(`${siteUrl}/${locale}/cart?error=payment`, 303)

  if (!cms || !order || !paypalReady()) return failure

  try {
    const paid = await capturePaypalOrder(cms, reference, paypalOrderId)
    if (!paid) return failure
    return NextResponse.redirect(
      `${siteUrl}/${locale}/checkout/success?ref=${encodeURIComponent(reference ?? '')}`,
      303,
    )
  } catch (error) {
    console.error(
      '[shop] PayPal capture failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return failure
  }
}
