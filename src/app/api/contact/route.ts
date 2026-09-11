import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { isLocale, defaultLocale } from '@/i18n/routing'
import { getCms, getSiteSettings } from '@/lib/cms'
import { contactSchema, toFieldErrors, type ContactResponse } from '@/lib/contact-schema'
import { countryOptions } from '@/lib/countries'
import { sendContactEmails } from '@/lib/email'
import { contactRateLimit, emailConfig } from '@/lib/env'
import { checkRateLimit, clientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Contact endpoint.
 *
 * Protections: honeypot field, per-IP rate limit, strict server-side schema.
 * The submission is stored in the CMS, then the notification and confirmation
 * e-mails are attempted. The response says whether e-mail actually went out,
 * so the visitor is never told a message was sent when it was not.
 */
export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  const key = createHash('sha256').update(clientKey(request.headers)).digest('hex').slice(0, 32)
  const limit = checkRateLimit(key, contactRateLimit.max, contactRateLimit.windowMs)

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, reason: 'rateLimit' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: toFieldErrors(parsed.error) }, { status: 422 })
  }

  const data = parsed.data

  // Honeypot: answer like a success so bots do not learn they were filtered.
  if (data.company && data.company.length > 0) {
    console.info('[contact] Submission rejected by the honeypot.')
    return NextResponse.json({ ok: true, emailSent: false })
  }

  const locale = data.locale && isLocale(data.locale) ? data.locale : defaultLocale
  const countryLabel =
    countryOptions(locale).find((entry) => entry.code === data.country)?.label ?? data.country

  let stored = false
  let submissionId: string | number | null = null
  const cms = await getCms()
  try {
    if (cms) {
      const created = await cms.create({
        collection: 'contact-submissions',
        overrideAccess: true,
        data: {
          name: data.name,
          organisation: data.organisation ?? '',
          email: data.email,
          country: countryLabel,
          requestType: data.requestType,
          subject: data.subject,
          message: data.message,
          locale,
          status: 'new',
          consentAt: new Date().toISOString(),
          emailDelivered: false,
        },
      })
      submissionId = created.id
      stored = true
    }
  } catch (error) {
    // Log the failure, not the content of the request.
    console.error(
      '[contact] Could not store the submission:',
      error instanceof Error ? error.message : 'unknown error',
    )
  }

  const settings = await getSiteSettings(locale)
  const recipient = emailConfig.to || settings.email || ''

  const emailSent = await sendContactEmails(
    {
      name: data.name,
      organisation: data.organisation ?? '',
      email: data.email,
      country: countryLabel,
      requestType: data.requestType,
      subject: data.subject,
      message: data.message,
      locale,
    },
    recipient,
  )

  if (cms && submissionId !== null && emailSent) {
    try {
      await cms.update({
        collection: 'contact-submissions',
        id: submissionId,
        overrideAccess: true,
        data: { emailDelivered: true },
      })
    } catch {
      /* the notification was sent; failing to flag it must not fail the request */
    }
  }

  if (!stored && !emailSent) {
    // Nothing was persisted and nothing was delivered: do not claim success.
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 })
  }

  console.info(
    `[contact] Request received (type=${data.requestType}, stored=${stored}, mail=${emailSent}).`,
  )

  return NextResponse.json({ ok: true, emailSent })
}
