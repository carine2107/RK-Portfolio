import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import {
  consumeLoginToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  sessionToken,
} from '@/lib/members'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Exchanges a single-use sign-in link for a session cookie. Called by the
 * verification page with a POST, so a mail scanner opening the link does not
 * consume it.
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
  if (!cms) return NextResponse.json({ ok: false }, { status: 503 })

  const member = await consumeLoginToken(cms, token)
  if (!member) {
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  response.cookies.set(SESSION_COOKIE, sessionToken(member.id), sessionCookieOptions())
  return response
}
