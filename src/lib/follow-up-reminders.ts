/**
 * Reminder e-mail for contact requests whose follow-up date has come
 * (background job, src/lib/retention-schedule.ts). One e-mail lists every due
 * request; each is then marked as reminded. Nothing happens without real SMTP
 * delivery: a reminder is never marked as sent when it was not.
 */
import type { Payload } from 'payload'

import { createTransport, emailReady, escapeHtml, wrapHtml } from '@/lib/email-layout'
import { emailConfig, siteUrl } from '@/lib/env'
import { OPEN_STATUSES } from '@/lib/follow-up'

export type DueRequest = {
  id: number | string
  name?: string | null
  organisation?: string | null
  subject?: string | null
  email?: string | null
  followUpAt?: string | null
}

export function reminderEmail(requests: DueRequest[], adminUrl: string) {
  const count = requests.length
  const subject =
    count === 1
      ? 'Relance prévue : 1 demande de contact à reprendre'
      : `Relances prévues : ${count} demandes de contact à reprendre`
  const date = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('fr-FR', { timeZone: 'Europe/Berlin' }) : ''
  const link = (request: DueRequest) => `${adminUrl}/collections/contact-submissions/${request.id}`

  const text = [
    subject,
    '',
    ...requests.map(
      (request) =>
        `- ${request.subject ?? ''} — ${[request.name, request.organisation].filter(Boolean).join(', ')} (relance du ${date(request.followUpAt)})\n  ${link(request)}`,
    ),
  ].join('\n')

  const html = wrapHtml(
    subject,
    `<p style="margin:0 0 16px">La date de relance de ces demandes est arrivée ; elles sont encore nouvelles ou en cours.</p>
<ul style="margin:0;padding-left:18px">${requests
      .map(
        (request) =>
          `<li style="margin:0 0 12px"><a href="${escapeHtml(link(request))}" style="color:#10233f;font-weight:600">${escapeHtml(request.subject ?? '')}</a><br><span style="color:#465568">${escapeHtml([request.name, request.organisation].filter(Boolean).join(', '))} · relance du ${escapeHtml(date(request.followUpAt))}</span></li>`,
      )
      .join('')}</ul>`,
    'Rappel automatique du site romialkenmogne.com. Pour ne plus le recevoir pour une demande, retirez sa date de relance ou changez son statut.',
  )
  return { subject, text, html }
}

async function recipient(payload: Payload): Promise<string> {
  try {
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    })) as { notificationEmail?: string | null; email?: string | null }
    return settings.notificationEmail || emailConfig.to || settings.email || ''
  } catch {
    return emailConfig.to
  }
}

/** Sends the reminder for due follow-ups; returns how many requests it covered. */
export async function sendFollowUpReminders(
  payload: Payload,
  now: Date = new Date(),
): Promise<number> {
  if (!emailReady()) return 0

  const due = await payload.find({
    collection: 'contact-submissions',
    where: {
      and: [
        { followUpAt: { less_than_equal: now.toISOString() } },
        { status: { in: [...OPEN_STATUSES] } },
        { followUpReminderSentAt: { exists: false } },
      ],
    },
    sort: 'followUpAt',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  if (due.docs.length === 0) return 0

  const to = await recipient(payload)
  if (!to) return 0

  const requests = due.docs as unknown as DueRequest[]
  const message = reminderEmail(requests, `${siteUrl}${payload.config.routes.admin}`)
  await createTransport().sendMail({ from: emailConfig.from, to, ...message })

  for (const request of requests) {
    await payload.update({
      collection: 'contact-submissions',
      id: request.id,
      data: { followUpReminderSentAt: now.toISOString() },
      overrideAccess: true,
      context: { followUpReminder: true },
    })
  }
  return requests.length
}
