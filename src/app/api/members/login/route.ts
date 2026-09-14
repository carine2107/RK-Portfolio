import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { emailReady } from '@/lib/email-layout'
import { contactRateLimit } from '@/lib/env'
import { requestLogin } from '@/lib/members'
import { checkRateLimit, clientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/

/**
 * Sends a sign-in link to a member. The answer is identical whether or not an
 * account exists for the address, so the form cannot be used to find buyers.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const key = createHash('sha256')
    .update(`member-login:${clientKey(request.headers)}`)
    .digest('hex')
    .slice(0, 32)
  const limit = checkRateLimit(key, contactRateLimit.max, contactRateLimit.windowMs)
  if (!limit.allowed) return NextResponse.json({ ok: false, reason: 'rateLimit' }, { status: 429 })

  let body: { email?: unknown; locale?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 400 })
  }
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, reason: 'email' }, { status: 422 })

  if (!emailReady()) return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 })
  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false, reason: 'server' }, { status: 503 })

  const locale =
    typeof body.locale === 'string' && isLocale(body.locale) ? body.locale : defaultLocale
  try {
    await requestLogin(cms, email, locale)
  } catch (error) {
    console.error(
      '[members] Sign-in request failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
  }
  return NextResponse.json({ ok: true })
}
