import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { findOrderByReference } from '@/lib/shop'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Order status for the confirmation page. The signed reference only reveals
 * the order number and its status — no name, address or amount.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const reference = new URL(request.url).searchParams.get('ref')
  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false }, { status: 503 })

  const order = await findOrderByReference(cms, reference)
  if (!order)
    return NextResponse.json(
      { ok: false },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  return NextResponse.json(
    { ok: true, number: order.number, status: order.status },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
