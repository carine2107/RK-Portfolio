import { OPTION_LABELS, QUALIFICATION_LABELS } from '@/lib/lead-score'
import { REQUEST_TYPE_LABELS } from '@/payload/collections/ContactSubmissions'

/**
 * CSV exports offered in the administration: newsletter subscribers and
 * contact requests. Headers and option labels follow the language of the
 * administration interface. Free of `server-only` for the unit tests.
 */

export type ExportLanguage = 'fr' | 'de' | 'en'
type Labels = Record<string, string>
type Doc = Record<string, unknown>
type Column = { header: Labels; value: (doc: Doc, lang: ExportLanguage) => string }

export const EXPORT_COLLECTIONS = ['subscribers', 'contact-submissions'] as const
export type ExportCollection = (typeof EXPORT_COLLECTIONS)[number]

export const SUBSCRIBER_STATUSES = ['pending', 'confirmed', 'unsubscribed'] as const

const SUBSCRIBER_STATUS_LABELS: Record<string, Labels> = {
  pending: {
    fr: 'En attente de confirmation',
    de: 'Bestätigung ausstehend',
    en: 'Awaiting confirmation',
  },
  confirmed: { fr: 'Confirmé', de: 'Bestätigt', en: 'Confirmed' },
  unsubscribed: { fr: 'Désinscrit', de: 'Abgemeldet', en: 'Unsubscribed' },
}

const CONTACT_STATUS_LABELS: Record<string, Labels> = {
  new: { fr: 'Nouvelle', de: 'Neu', en: 'New' },
  inProgress: { fr: 'En cours', de: 'In Bearbeitung', en: 'In progress' },
  answered: { fr: 'Répondue', de: 'Beantwortet', en: 'Answered' },
  archived: { fr: 'Archivée', de: 'Archiviert', en: 'Archived' },
}

const YES_NO: Record<'yes' | 'no', Labels> = {
  yes: { fr: 'oui', de: 'ja', en: 'yes' },
  no: { fr: 'non', de: 'nein', en: 'no' },
}

const text = (key: string) => (doc: Doc) =>
  typeof doc[key] === 'string' || typeof doc[key] === 'number' ? String(doc[key]) : ''

/** Date and time in UTC, "2026-09-14 17:35" (sortable, unambiguous). */
const dateTime = (key: string) => (doc: Doc) => {
  const value = doc[key]
  if (typeof value !== 'string') return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16).replace('T', ' ')
}

/** Label of a select value in the export language; the raw value when unknown. */
const option =
  (key: string, labels: Record<string, Labels>) => (doc: Doc, lang: ExportLanguage) => {
    const value = doc[key]
    if (typeof value !== 'string' || !value) return ''
    return labels[value]?.[lang] ?? value
  }

const h = (fr: string, de: string, en: string): Labels => ({ fr, de, en })

const COLUMNS: Record<ExportCollection, Column[]> = {
  subscribers: [
    { header: h('E-mail', 'E-Mail', 'E-mail'), value: text('email') },
    { header: h('Langue', 'Sprache', 'Language'), value: text('locale') },
    { header: h('Statut', 'Status', 'Status'), value: option('status', SUBSCRIBER_STATUS_LABELS) },
    {
      header: h('Inscription (UTC)', 'Anmeldung (UTC)', 'Signed up (UTC)'),
      value: dateTime('createdAt'),
    },
    {
      header: h('Consentement (UTC)', 'Einwilligung (UTC)', 'Consent (UTC)'),
      value: dateTime('consentAt'),
    },
    {
      header: h('Confirmation (UTC)', 'Bestätigung (UTC)', 'Confirmed (UTC)'),
      value: dateTime('confirmedAt'),
    },
    {
      header: h('Désinscription (UTC)', 'Abmeldung (UTC)', 'Unsubscribed (UTC)'),
      value: dateTime('unsubscribedAt'),
    },
    { header: h('Origine', 'Herkunft', 'Source'), value: text('source') },
  ],
  'contact-submissions': [
    {
      header: h('Reçue le (UTC)', 'Eingegangen (UTC)', 'Received (UTC)'),
      value: dateTime('createdAt'),
    },
    {
      header: h('Priorité', 'Priorität', 'Priority'),
      value: option('priority', OPTION_LABELS.priority),
    },
    { header: h('Score', 'Score', 'Score'), value: text('leadScore') },
    { header: h('Statut', 'Status', 'Status'), value: option('status', CONTACT_STATUS_LABELS) },
    { header: h('Nom', 'Name', 'Name'), value: text('name') },
    { header: h('Organisation', 'Organisation', 'Organisation'), value: text('organisation') },
    { header: h('E-mail', 'E-Mail', 'E-mail'), value: text('email') },
    { header: h('Pays', 'Land', 'Country'), value: text('country') },
    {
      header: h('Type de demande', 'Art der Anfrage', 'Type of request'),
      value: option('requestType', REQUEST_TYPE_LABELS),
    },
    {
      header: QUALIFICATION_LABELS.organisationType,
      value: option('organisationType', OPTION_LABELS.organisationType),
    },
    { header: QUALIFICATION_LABELS.budget, value: option('budget', OPTION_LABELS.budget) },
    { header: QUALIFICATION_LABELS.timeline, value: option('timeline', OPTION_LABELS.timeline) },
    {
      header: QUALIFICATION_LABELS.decisionRole,
      value: option('decisionRole', OPTION_LABELS.decisionRole),
    },
    { header: h('Sujet', 'Betreff', 'Subject'), value: text('subject') },
    { header: h('Message', 'Nachricht', 'Message'), value: text('message') },
    { header: h('Langue', 'Sprache', 'Language'), value: text('locale') },
    {
      header: h('Notification envoyée', 'Benachrichtigung gesendet', 'Notification delivered'),
      value: (doc, lang) => YES_NO[doc.emailDelivered === true ? 'yes' : 'no'][lang] ?? '',
    },
  ],
}

const FILE_NAMES: Record<ExportCollection, Labels> = {
  subscribers: h('abonnes-newsletter', 'newsletter-abonnenten', 'newsletter-subscribers'),
  'contact-submissions': h('demandes-de-contact', 'kontaktanfragen', 'contact-requests'),
}

export function isExportCollection(value: string): value is ExportCollection {
  return (EXPORT_COLLECTIONS as readonly string[]).includes(value)
}

export function exportLanguage(value: string | null): ExportLanguage {
  return value === 'de' || value === 'en' ? value : 'fr'
}

/** Header row + one row per document. */
export function exportRows(
  collection: ExportCollection,
  docs: Doc[],
  lang: ExportLanguage,
): string[][] {
  const columns = COLUMNS[collection]
  return [
    columns.map((column) => column.header[lang] ?? column.header.en ?? ''),
    ...docs.map((doc) => columns.map((column) => column.value(doc, lang))),
  ]
}

export function exportFileName(
  collection: ExportCollection,
  lang: ExportLanguage,
  now = new Date(),
): string {
  return `${FILE_NAMES[collection][lang]}-${now.toISOString().slice(0, 10)}.csv`
}
