import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { confirmSubscription } from '@/lib/newsletter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Confirms a subscription. Called by the confirmation page with a POST — never
 * a GET link — so that mail scanners opening links cannot confirm by themselves.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let token = ''
  try {
    const body = (await request.json()) as { token?: unknown }
    token = typeof body.token === 'string' ? body.token : ''
  } catch {
    /* invalid body */
  }

  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false, status: 'error' }, { status: 503 })

  const result = await confirmSubscription(cms, token)
  return NextResponse.json(
    { ok: result.status === 'confirmed', status: result.status },
    { status: result.status === 'confirmed' ? 200 : 400, headers: { 'Cache-Control': 'no-store' } },
  )
}
