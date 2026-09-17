import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { isLocale, defaultLocale } from '@/i18n/routing'
import { getCms, getContactNotificationEmail, getSiteSettings } from '@/lib/cms'
import { businessSlug, contactRecipients, type RoutingBusiness } from '@/lib/contact-routing'
import { contactSchema, toFieldErrors, type ContactResponse } from '@/lib/contact-schema'
import { countryOptions } from '@/lib/countries'
import { sendContactEmails } from '@/lib/email'
import { contactRateLimit, emailConfig } from '@/lib/env'
import { scoreLead } from '@/lib/lead-score'
import { checkRateLimit, clientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Contact endpoint.
 *
 * Protections: honeypot field, per-IP rate limit, strict server-side schema.
 * The submission is scored (lead qualification), stored in the CMS, then the
 * notification and confirmation e-mails are attempted. The response says
 * whether e-mail actually went out, so the visitor is never told a message was
 * sent when it was not. The score itself is never returned to the visitor.
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
  const { score, priority } = scoreLead(data)
  const qualification = {
    organisationType: data.organisationType,
    budget: data.budget,
    timeline: data.timeline,
    decisionRole: data.decisionRole,
  }

  // Company the request concerns: a published, active business with this slug.
  let business: (NonNullable<RoutingBusiness> & { id: number | string }) | null = null
  const slug = businessSlug(data.business)
  const cms = await getCms()
  if (cms && slug) {
    try {
      const found = await cms.find({
        collection: 'businesses',
        locale,
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: 'published' } },
            { active: { equals: true } },
          ],
        },
      })
      const doc = found.docs[0] as { id: number; name?: string; contactEmail?: string | null }
      if (doc) business = { id: doc.id, name: doc.name ?? '', contactEmail: doc.contactEmail }
    } catch {
      /* unknown company: handled as a general request */
    }
  }

  let stored = false
  let submissionId: string | number | null = null
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
          business: business ? (business.id as number) : null,
          subject: data.subject,
          message: data.message,
          ...qualification,
          leadScore: score,
          priority,
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
  // Site settings first, then EMAIL_TO, then the published address.
  const general = (await getContactNotificationEmail()) || emailConfig.to || settings.email || ''
  const recipients = contactRecipients(business, general)

  const emailSent = await sendContactEmails(
    {
      name: data.name,
      organisation: data.organisation ?? '',
      email: data.email,
      country: countryLabel,
      requestType: data.requestType,
      business: business?.name ?? '',
      subject: data.subject,
      message: data.message,
      ...qualification,
      score,
      priority,
      locale,
    },
    recipients.to,
    recipients.cc,
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
    `[contact] Request received (type=${data.requestType}, priority=${priority}, stored=${stored}, mail=${emailSent}).`,
  )

  return NextResponse.json({
    ok: true,
    emailSent,
    // Priority requests are offered the booking link right away, when one is configured.
    suggestBooking: priority === 'high' && Boolean(settings.bookingUrl),
  })
}
