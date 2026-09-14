import type { CollectionConfig } from 'payload'

import {
  BUDGETS,
  DECISION_ROLES,
  OPTION_LABELS,
  ORGANISATION_TYPES,
  PRIORITIES,
  QUALIFICATION_LABELS,
  TIMELINES,
} from '../../lib/lead-score'
import { isAdmin, isAdminOrEditor } from '../access'
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
  'other',
] as const

export type RequestType = (typeof REQUEST_TYPES)[number]

/** Same wording as the public form, so the admin reads like the site. */
const REQUEST_TYPE_LABELS: Record<RequestType, Record<string, string>> = {
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
  other: tr('Autre', 'Sonstiges', 'Other'),
}

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
      options: [
        { label: tr('Nouvelle', 'Neu', 'New'), value: 'new' },
        { label: tr('En cours', 'In Bearbeitung', 'In progress'), value: 'inProgress' },
        { label: tr('Répondue', 'Beantwortet', 'Answered'), value: 'answered' },
        { label: tr('Archivée', 'Archiviert', 'Archived'), value: 'archived' },
      ],
      admin: { position: 'sidebar' },
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
  ],
}
