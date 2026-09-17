import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'

import {
  BUDGETS,
  DECISION_ROLES,
  OPTION_LABELS,
  ORGANISATION_TYPES,
  PRIORITIES,
  QUALIFICATION_LABELS,
  TIMELINES,
} from '../../lib/lead-score'
import {
  authorName,
  historyEntries,
  stampNotes,
  type HistoryEntry,
  type NoteEntry,
} from '../../lib/follow-up'
import { isAdmin, isAdminOrEditor } from '../access'
import { removeFromSheets, syncToSheets } from '../hooks/sheets'
import { GROUPS, tr } from '../i18n'

export const REQUEST_TYPES = [
  'consulting',
  'dueDiligence',
  'advisory',
  'projectManagement',
  'smeProgramme',
  'training',
  'speaking',
  'partnership',
  'bookOrder',
  'other',
] as const

export type RequestType = (typeof REQUEST_TYPES)[number]

/** Same wording as the public form, so the admin reads like the site. */
export const REQUEST_TYPE_LABELS: Record<RequestType, Record<string, string>> = {
  consulting: tr('Mission de conseil', 'Beratungsmandat', 'Consulting assignment'),
  dueDiligence: tr(
    'Due diligence financière',
    'Financial Due Diligence',
    'Financial due diligence',
  ),
  advisory: tr('Accompagnement business', 'Business Advisory', 'Business advisory'),
  projectManagement: tr('Gestion de projet', 'Projektmanagement', 'Project management'),
  smeProgramme: tr(
    'Programme PME / entrepreneuriat',
    'KMU-/Entrepreneurship-Programm',
    'SME / entrepreneurship programme',
  ),
  training: tr('Formation / mentorat', 'Training / Mentoring', 'Training / mentoring'),
  speaking: tr('Conférence / médias', 'Speaking / Medien', 'Speaking / media'),
  partnership: tr('Partenariat', 'Partnerschaft', 'Partnership'),
  bookOrder: tr('Commande de livre', 'Buchbestellung', 'Book order'),
  other: tr('Autre', 'Sonstiges', 'Other'),
}

const STATUS_OPTIONS = [
  { label: tr('Nouvelle', 'Neu', 'New'), value: 'new' },
  { label: tr('En cours', 'In Bearbeitung', 'In progress'), value: 'inProgress' },
  { label: tr('Répondue', 'Beantwortet', 'Answered'), value: 'answered' },
  { label: tr('Archivée', 'Archiviert', 'Archived'), value: 'archived' },
]

type FollowUpDoc = {
  status?: string | null
  followUpAt?: string | null
  answeredAt?: string | null
  notes?: NoteEntry[] | null
  history?: HistoryEntry[] | null
}

/**
 * Follow-up bookkeeping on every save: stamps new notes, appends to the
 * history (always rebuilt from the stored one, so it cannot be edited), records
 * when the request was answered and re-arms the reminder when its date changes.
 */
const trackFollowUp: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
  req,
  context,
}) => {
  if (operation !== 'update' || !originalDoc) return data
  const previous = originalDoc as FollowUpDoc
  const next = { ...previous, ...(data as FollowUpDoc) }
  const now = new Date()
  const author = authorName(req.user as { name?: string; email?: string } | null)

  if (Array.isArray(data.notes)) data.notes = stampNotes(data.notes as NoteEntry[], author, now)

  const entries: HistoryEntry[] = context?.followUpReminder
    ? [{ at: now.toISOString(), action: 'reminderSent' }]
    : historyEntries(previous, next, author, now)
  data.history = [...(previous.history ?? []), ...entries]

  if (!context?.followUpReminder && entries.some((entry) => entry.action !== 'statusChanged')) {
    data.followUpReminderSentAt = null
  }
  if (next.status === 'answered' && previous.status !== 'answered' && !previous.answeredAt) {
    data.answeredAt = now.toISOString()
  }
  return data
}

const followUpFields: Field[] = [
  {
    type: 'collapsible',
    label: tr('Suivi', 'Nachverfolgung', 'Follow-up'),
    admin: { initCollapsed: false },
    fields: [
      {
        name: 'replyWithTemplate',
        type: 'ui',
        admin: {
          components: { Field: '/payload/components/ReplyWithTemplate#ReplyWithTemplate' },
        },
      },
      {
        name: 'notes',
        type: 'array',
        label: tr('Notes internes', 'Interne Notizen', 'Internal notes'),
        labels: {
          singular: tr('Note', 'Notiz', 'Note'),
          plural: tr('Notes', 'Notizen', 'Notes'),
        },
        admin: {
          description: tr(
            'Visibles uniquement dans l’administration. La date et l’auteur sont ajoutés à l’enregistrement.',
            'Nur in der Verwaltung sichtbar. Datum und Verfasser werden beim Speichern ergänzt.',
            'Only visible in the admin. Date and author are added when saving.',
          ),
        },
        fields: [
          { name: 'text', type: 'textarea', label: tr('Note', 'Notiz', 'Note'), required: true },
          {
            type: 'row',
            fields: [
              {
                name: 'at',
                type: 'date',
                label: tr('Le', 'Am', 'On'),
                admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
              },
              {
                name: 'author',
                type: 'text',
                label: tr('Par', 'Von', 'By'),
                admin: { readOnly: true },
              },
            ],
          },
        ],
      },
      {
        name: 'history',
        type: 'array',
        label: tr('Historique', 'Verlauf', 'History'),
        labels: {
          singular: tr('Événement', 'Ereignis', 'Event'),
          plural: tr('Événements', 'Ereignisse', 'Events'),
        },
        admin: {
          readOnly: true,
          initCollapsed: true,
          description: tr(
            'Rempli automatiquement : changements de statut, dates de relance, rappels envoyés.',
            'Automatisch gefüllt: Statusänderungen, Wiedervorlagen, gesendete Erinnerungen.',
            'Filled in automatically: status changes, follow-up dates, reminders sent.',
          ),
        },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'at',
                type: 'date',
                label: tr('Le', 'Am', 'On'),
                admin: { date: { pickerAppearance: 'dayAndTime' } },
              },
              {
                name: 'action',
                type: 'select',
                label: tr('Événement', 'Ereignis', 'Event'),
                options: [
                  {
                    label: tr('Changement de statut', 'Statusänderung', 'Status changed'),
                    value: 'statusChanged',
                  },
                  {
                    label: tr('Relance prévue', 'Wiedervorlage geplant', 'Follow-up planned'),
                    value: 'followUpSet',
                  },
                  {
                    label: tr('Relance retirée', 'Wiedervorlage entfernt', 'Follow-up removed'),
                    value: 'followUpCleared',
                  },
                  {
                    label: tr('Rappel envoyé', 'Erinnerung gesendet', 'Reminder sent'),
                    value: 'reminderSent',
                  },
                ],
              },
              { name: 'author', type: 'text', label: tr('Par', 'Von', 'By') },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'fromStatus',
                type: 'select',
                label: tr('De', 'Von', 'From'),
                options: STATUS_OPTIONS,
                admin: { condition: (_, row) => row?.action === 'statusChanged' },
              },
              {
                name: 'toStatus',
                type: 'select',
                label: tr('À', 'Zu', 'To'),
                options: STATUS_OPTIONS,
                admin: { condition: (_, row) => row?.action === 'statusChanged' },
              },
              {
                name: 'date',
                type: 'date',
                label: tr('Date de relance', 'Wiedervorlage am', 'Follow-up date'),
                admin: { condition: (_, row) => row?.action === 'followUpSet' },
              },
            ],
          },
        ],
      },
    ],
  },
]

const options = <T extends string>(
  values: readonly T[],
  labels: Record<T, Record<string, string>>,
) => values.map((value) => ({ value, label: labels[value] }))

/**
 * Contact requests. Created by the public API route only (`create: () => false`
 * blocks the REST API; the route uses the local API with `overrideAccess`).
 * Never publicly readable.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: tr('Demande de contact', 'Kontaktanfrage', 'Contact request'),
    plural: tr('Demandes de contact', 'Kontaktanfragen', 'Contact requests'),
  },
  admin: {
    group: GROUPS.administration,
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'priority', 'leadScore', 'status', 'createdAt'],
    components: {
      beforeListTable: [
        {
          path: '/payload/components/ExportCsvButton#ExportCsvButton',
          clientProps: { collection: 'contact-submissions' },
        },
        '/payload/components/SheetsSync#SheetsSync',
      ],
    },
    description: tr(
      'Demandes reçues via le formulaire « Travailler avec moi », avec une priorité calculée à partir des réponses du visiteur (cliquer sur la colonne « Score » pour trier). Protection des données : une demande restée sans modification pendant 24 mois (durée réglable) est supprimée automatiquement.',
      'Anfragen über das Formular „Zusammenarbeiten“, mit einer aus den Antworten des Besuchers berechneten Priorität (Spalte „Score“ zum Sortieren anklicken). Datenschutz: Eine Anfrage, die 24 Monate lang nicht geändert wurde (Dauer einstellbar), wird automatisch gelöscht.',
      'Requests received through the "Work With Me" form, with a priority computed from the visitor’s answers (click the "Score" column to sort). Data protection: a request left unchanged for 24 months (configurable) is deleted automatically.',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [trackFollowUp],
    afterChange: [syncToSheets('contact-submissions')],
    afterDelete: [removeFromSheets('contact-submissions')],
  },
  fields: [
    { name: 'name', type: 'text', label: tr('Nom', 'Name', 'Name'), required: true },
    {
      name: 'organisation',
      type: 'text',
      label: tr('Organisation', 'Organisation', 'Organisation'),
    },
    { name: 'email', type: 'email', label: tr('E-mail', 'E-Mail', 'E-mail'), required: true },
    { name: 'country', type: 'text', label: tr('Pays', 'Land', 'Country'), required: true },
    {
      name: 'requestType',
      type: 'select',
      label: tr('Type de demande', 'Art der Anfrage', 'Type of request'),
      required: true,
      options: REQUEST_TYPES.map((value) => ({ label: REQUEST_TYPE_LABELS[value], value })),
    },
    { name: 'subject', type: 'text', label: tr('Sujet', 'Betreff', 'Subject'), required: true },
    {
      name: 'message',
      type: 'textarea',
      label: tr('Message', 'Nachricht', 'Message'),
      required: true,
    },
    {
      type: 'collapsible',
      label: tr('Qualification', 'Qualifizierung', 'Qualification'),
      admin: {
        initCollapsed: false,
        description: tr(
          'Réponses facultatives du visiteur. Vide = question sans réponse.',
          'Optionale Antworten des Besuchers. Leer = nicht beantwortet.',
          'Optional answers from the visitor. Empty = not answered.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'organisationType',
              type: 'select',
              label: QUALIFICATION_LABELS.organisationType,
              options: options(ORGANISATION_TYPES, OPTION_LABELS.organisationType),
            },
            {
              name: 'budget',
              type: 'select',
              label: QUALIFICATION_LABELS.budget,
              options: options(BUDGETS, OPTION_LABELS.budget),
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'timeline',
              type: 'select',
              label: QUALIFICATION_LABELS.timeline,
              options: options(TIMELINES, OPTION_LABELS.timeline),
            },
            {
              name: 'decisionRole',
              type: 'select',
              label: QUALIFICATION_LABELS.decisionRole,
              options: options(DECISION_ROLES, OPTION_LABELS.decisionRole),
            },
          ],
        },
      ],
    },
    {
      name: 'locale',
      type: 'text',
      label: tr('Langue du visiteur', 'Sprache des Besuchers', 'Visitor language'),
      admin: {
        readOnly: true,
        description: tr(
          'Langue utilisée par le visiteur.',
          'Vom Besucher verwendete Sprache.',
          'Language the visitor used.',
        ),
      },
    },
    {
      name: 'priority',
      type: 'select',
      label: tr('Priorité', 'Priorität', 'Priority'),
      index: true,
      options: options(PRIORITIES, OPTION_LABELS.priority),
      admin: {
        position: 'sidebar',
        description: tr(
          'Calculée à la réception (score 60+ : haute, 35 à 59 : moyenne). Modifiable si besoin.',
          'Beim Eingang berechnet (Score ab 60: hoch, 35–59: mittel). Bei Bedarf änderbar.',
          'Computed on receipt (score 60+: high, 35–59: medium). Can be changed if needed.',
        ),
      },
    },
    {
      name: 'leadScore',
      type: 'number',
      label: tr('Score', 'Score', 'Score'),
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: tr(
          'Sur 100 : budget (30), démarrage (25), rôle dans la décision (20), type de demande (15), organisation renseignée et message détaillé (10). Le type d’organisation n’est pas noté.',
          'Von 100: Budget (30), Beginn (25), Rolle bei der Entscheidung (20), Art der Anfrage (15), Organisation angegeben und ausführliche Nachricht (10). Die Art der Organisation wird nicht bewertet.',
          'Out of 100: budget (30), start (25), role in the decision (20), type of request (15), organisation given and detailed message (10). The type of organisation is not scored.',
        ),
      },
    },
    {
      name: 'status',
      type: 'select',
      label: tr('Statut', 'Status', 'Status'),
      defaultValue: 'new',
      options: STATUS_OPTIONS,
      admin: { position: 'sidebar' },
    },
    {
      name: 'followUpAt',
      type: 'date',
      label: tr('Relance prévue le', 'Wiedervorlage am', 'Follow up on'),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
        description: tr(
          'Un e-mail de rappel est envoyé ce jour-là si la demande est encore nouvelle ou en cours.',
          'An diesem Tag kommt eine Erinnerungs-E-Mail, wenn die Anfrage noch neu oder in Bearbeitung ist.',
          'A reminder e-mail is sent on that day if the request is still new or in progress.',
        ),
      },
    },
    {
      name: 'followUpReminderSentAt',
      type: 'date',
      label: tr('Rappel envoyé le', 'Erinnerung gesendet am', 'Reminder sent on'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => Boolean(data?.followUpReminderSentAt),
      },
    },
    {
      name: 'answeredAt',
      type: 'date',
      label: tr('Répondue le', 'Beantwortet am', 'Answered on'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => Boolean(data?.answeredAt),
      },
    },

    {
      name: 'emailDelivered',
      type: 'checkbox',
      label: tr('Notification envoyée', 'Benachrichtigung gesendet', 'Notification delivered'),
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: tr(
          'Indique si l’e-mail de notification a réellement pu être envoyé.',
          'Zeigt, ob die Benachrichtigungs-E-Mail tatsächlich versendet werden konnte.',
          'Whether the notification e-mail could actually be sent.',
        ),
      },
    },
    {
      name: 'consentAt',
      type: 'date',
      label: tr('Consentement donné le', 'Einwilligung erteilt am', 'Consent given at'),
      admin: {
        readOnly: true,
        description: tr(
          'Horodatage du consentement à la politique de confidentialité.',
          'Zeitstempel der Einwilligung zur Datenschutzerklärung.',
          'Timestamp of the privacy consent.',
        ),
      },
    },
    ...followUpFields,
  ],
}
