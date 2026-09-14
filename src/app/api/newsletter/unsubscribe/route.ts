import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { unsubscribe } from '@/lib/newsletter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Unsubscription.
 * - From the unsubscribe page: POST with a JSON body `{ token }`.
 * - One-click from the mail client (RFC 8058): POST to the List-Unsubscribe
 *   URL, token in the query string, body `List-Unsubscribe=One-Click`.
 * GET is deliberately not supported: link scanners must not unsubscribe anyone.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let token = new URL(request.url).searchParams.get('token') ?? ''
  if (!token && request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = (await request.json()) as { token?: unknown }
      token = typeof body.token === 'string' ? body.token : ''
    } catch {
      /* invalid body */
    }
  }

  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false, status: 'error' }, { status: 503 })

  const status = await unsubscribe(cms, token)
  return NextResponse.json(
    { ok: status === 'unsubscribed', status },
    { status: status === 'unsubscribed' ? 200 : 400, headers: { 'Cache-Control': 'no-store' } },
  )
}
