import type { CollectionConfig } from 'payload'

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
    defaultColumns: ['subject', 'name', 'requestType', 'status', 'createdAt'],
    description: tr(
      'Demandes reçues via le formulaire « Travailler avec moi ». Protection des données : une demande restée sans modification pendant 24 mois (durée réglable) est supprimée automatiquement.',
      'Anfragen über das Formular „Zusammenarbeiten“. Datenschutz: Eine Anfrage, die 24 Monate lang nicht geändert wurde (Dauer einstellbar), wird automatisch gelöscht.',
      'Requests received through the "Work With Me" form. Data protection: a request left unchanged for 24 months (configurable) is deleted automatically.',
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
