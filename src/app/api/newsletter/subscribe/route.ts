import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { contactRateLimit } from '@/lib/env'
import { subscribe } from '@/lib/newsletter'
import { newsletterSchema, type NewsletterResponse } from '@/lib/newsletter-schema'
import { checkRateLimit, clientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Newsletter sign-up (double opt-in). The answer never reveals whether an
 * address is already subscribed; it only says the truth about e-mail delivery.
 */
export async function POST(request: Request): Promise<NextResponse<NewsletterResponse>> {
  const key = createHash('sha256')
    .update(`newsletter:${clientKey(request.headers)}`)
    .digest('hex')
    .slice(0, 32)
  const limit = checkRateLimit(key, contactRateLimit.max, contactRateLimit.windowMs)
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, reason: 'rateLimit' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 400 })
  }

  const parsed = newsletterSchema.safeParse(body)
  if (!parsed.success) {
    const errors: Partial<Record<'email' | 'consent', string>> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if ((field === 'email' || field === 'consent') && !errors[field]) errors[field] = field
    }
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  // Honeypot: look like a success, store nothing.
  if (parsed.data.company) return NextResponse.json({ ok: true })

  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false, reason: 'server' }, { status: 503 })

  const locale =
    parsed.data.locale && isLocale(parsed.data.locale) ? parsed.data.locale : defaultLocale
  try {
    const result = await subscribe(cms, {
      email: parsed.data.email,
      locale,
      source: parsed.data.source,
    })
    if (result === 'unavailable') {
      return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 })
    }
    if (result === 'failed') {
      return NextResponse.json({ ok: false, reason: 'server' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[newsletter] Sign-up failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 })
  }
}
