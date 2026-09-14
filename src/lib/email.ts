import 'server-only'

import type { Locale } from '@/i18n/routing'
import { createTransport, escapeHtml, wrapHtml } from '@/lib/email-layout'
import { emailConfig, siteUrl } from '@/lib/env'
import { OPTION_LABELS, QUALIFICATION_LABELS, type Priority } from '@/lib/lead-score'

export type ContactEmailData = {
  name: string
  organisation: string
  email: string
  country: string
  requestType: string
  subject: string
  message: string
  organisationType?: string
  budget?: string
  timeline?: string
  decisionRole?: string
  /** Lead score and priority: shown to the owner only, never to the visitor. */
  score: number
  priority: Priority
  locale: Locale
}

/* -------------------------------------------------------------------------- */
/* Templates (FR / DE / EN)                                                   */
/* -------------------------------------------------------------------------- */

type Template = {
  ownerSubject: (data: ContactEmailData, priority: string) => string
  ownerIntro: string
  labels: Record<
    'name' | 'organisation' | 'email' | 'country' | 'type' | 'subject' | 'message' | 'priority',
    string
  >
  confirmationSubject: string
  confirmationGreeting: (name: string) => string
  confirmationBody: string[]
  confirmationSignature: string
  footer: string
}

const templates: Record<Locale, Template> = {
  en: {
    ownerSubject: (data, priority) =>
      `[${priority} priority] New request — ${data.requestType} — ${data.name}`,
    ownerIntro: 'A new request was submitted through the website contact form.',
    labels: {
      name: 'Name',
      organisation: 'Organisation',
      email: 'E-mail',
      country: 'Country',
      type: 'Type of request',
      subject: 'Subject',
      message: 'Message',
      priority: 'Priority (score)',
    },
    confirmationSubject: 'Your request has been received — Romial Kenmogne',
    confirmationGreeting: (name) => `Dear ${name},`,
    confirmationBody: [
      'Thank you for your message. Your request has been received and will be answered personally, usually within two working days.',
      'A copy of the details you submitted is included below for your records.',
    ],
    confirmationSignature: 'Romial Kenmogne\nBusiness & Financial Consultant | Project Manager',
    footer: 'This message was sent automatically. Please do not reply to this address.',
  },
  fr: {
    ownerSubject: (data, priority) =>
      `[Priorité ${priority.toLowerCase()}] Nouvelle demande — ${data.requestType} — ${data.name}`,
    ownerIntro: 'Une nouvelle demande a été envoyée depuis le formulaire de contact du site.',
    labels: {
      name: 'Nom',
      organisation: 'Organisation',
      email: 'E-mail',
      country: 'Pays',
      type: 'Type de demande',
      subject: 'Sujet',
      message: 'Message',
      priority: 'Priorité (score)',
    },
    confirmationSubject: 'Votre demande a bien été reçue — Romial Kenmogne',
    confirmationGreeting: (name) => `Bonjour ${name},`,
    confirmationBody: [
      'Merci pour votre message. Votre demande a bien été reçue et recevra une réponse personnelle, généralement sous deux jours ouvrés.',
      'Une copie des informations transmises figure ci-dessous.',
    ],
    confirmationSignature: 'Romial Kenmogne\nConsultant en business et finance | Chef de projet',
    footer: 'Ce message a été envoyé automatiquement. Merci de ne pas répondre à cette adresse.',
  },
  de: {
    ownerSubject: (data, priority) =>
      `[Priorität ${priority.toLowerCase()}] Neue Anfrage — ${data.requestType} — ${data.name}`,
    ownerIntro: 'Über das Kontaktformular der Website ist eine neue Anfrage eingegangen.',
    labels: {
      name: 'Name',
      organisation: 'Organisation',
      email: 'E-Mail',
      country: 'Land',
      type: 'Art der Anfrage',
      subject: 'Betreff',
      message: 'Nachricht',
      priority: 'Priorität (Score)',
    },
    confirmationSubject: 'Ihre Anfrage ist eingegangen — Romial Kenmogne',
    confirmationGreeting: (name) => `Guten Tag ${name},`,
    confirmationBody: [
      'Vielen Dank für Ihre Nachricht. Ihre Anfrage ist eingegangen und wird persönlich beantwortet, in der Regel innerhalb von zwei Werktagen.',
      'Eine Kopie der übermittelten Angaben finden Sie unten.',
    ],
    confirmationSignature: 'Romial Kenmogne\nBusiness- & Finanzberater | Projektmanager',
    footer:
      'Diese Nachricht wurde automatisch versendet. Bitte antworten Sie nicht auf diese Adresse.',
  },
}

/** Label of an optional qualification answer in the e-mail language, '' when unanswered. */
function answer(
  field: 'organisationType' | 'budget' | 'timeline' | 'decisionRole',
  value: string | undefined,
  locale: Locale,
): string {
  const labels = OPTION_LABELS[field] as Record<string, { fr: string; de: string; en: string }>
  return value && labels[value] ? labels[value][locale] : ''
}

function detailsRows(data: ContactEmailData, template: Template): [string, string][] {
  const { locale } = data
  return [
    [template.labels.name, data.name],
    [template.labels.organisation, data.organisation],
    [template.labels.email, data.email],
    [template.labels.country, data.country],
    [template.labels.type, data.requestType],
    [
      QUALIFICATION_LABELS.organisationType[locale],
      answer('organisationType', data.organisationType, locale),
    ],
    [QUALIFICATION_LABELS.budget[locale], answer('budget', data.budget, locale)],
    [QUALIFICATION_LABELS.timeline[locale], answer('timeline', data.timeline, locale)],
    [QUALIFICATION_LABELS.decisionRole[locale], answer('decisionRole', data.decisionRole, locale)],
    [template.labels.subject, data.subject],
    [template.labels.message, data.message],
  ].filter(([, value]) => value !== '') as [string, string][]
}

function detailsHtml(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#465568;vertical-align:top;white-space:nowrap">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;white-space:pre-line">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>`
}

function detailsText(rows: [string, string][]): string {
  return rows.map(([label, value]) => `${label}: ${value}`).join('\n')
}

/* -------------------------------------------------------------------------- */
/* Sending                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Sends the owner notification and the visitor confirmation.
 * Returns `false` (without throwing) when e-mail is not configured or the
 * provider refuses the message, so the caller can tell the visitor the truth.
 */
export async function sendContactEmails(
  data: ContactEmailData,
  recipient: string,
): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.host || !emailConfig.from || !recipient) {
    console.info('[contact] E-mail delivery disabled — request stored without notification.')
    return false
  }

  const template = templates[data.locale]
  const rows = detailsRows(data, template)
  const priority = OPTION_LABELS.priority[data.priority][data.locale]
  const ownerRows: [string, string][] = [
    [template.labels.priority, `${priority} (${data.score}/100)`],
    ...rows,
  ]

  try {
    const transport = createTransport()

    await transport.sendMail({
      from: emailConfig.from,
      to: recipient,
      replyTo: data.email,
      subject: template.ownerSubject(data, priority),
      text: `${template.ownerIntro}\n\n${detailsText(ownerRows)}\n\n${siteUrl}/admin`,
      html: wrapHtml(
        template.ownerSubject(data, priority),
        `<p style="margin:0 0 16px">${escapeHtml(template.ownerIntro)}</p>${detailsHtml(ownerRows)}`,
        template.footer,
      ),
    })

    await transport.sendMail({
      from: emailConfig.from,
      to: data.email,
      subject: template.confirmationSubject,
      text: [
        template.confirmationGreeting(data.name),
        '',
        ...template.confirmationBody,
        '',
        detailsText(rows),
        '',
        template.confirmationSignature,
        '',
        template.footer,
      ].join('\n'),
      html: wrapHtml(
        template.confirmationSubject,
        `<p style="margin:0 0 16px">${escapeHtml(template.confirmationGreeting(data.name))}</p>` +
          template.confirmationBody
            .map((paragraph) => `<p style="margin:0 0 12px">${escapeHtml(paragraph)}</p>`)
            .join('') +
          detailsHtml(rows) +
          `<p style="margin:20px 0 0;white-space:pre-line;color:#465568">${escapeHtml(
            template.confirmationSignature,
          )}</p>`,
        template.footer,
      ),
    })

    return true
  } catch (error) {
    // Never log the message body or the visitor's address.
    console.error(
      '[contact] E-mail delivery failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return false
  }
}
