import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

const dateField = (name: string, label: Record<string, string>) =>
  ({
    name,
    type: 'date',
    label,
    admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
  }) as const

/**
 * RK Insights newsletter subscribers (double opt-in). Created only by the
 * public API; no confirmation or unsubscription secret is stored (signed links).
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: tr('Abonné newsletter', 'Newsletter-Abonnent', 'Newsletter subscriber'),
    plural: tr('Abonnés newsletter', 'Newsletter-Abonnenten', 'Newsletter subscribers'),
  },
  admin: {
    group: GROUPS.administration,
    useAsTitle: 'email',
    defaultColumns: ['email', 'locale', 'status', 'confirmedAt', 'createdAt'],
    components: {
      beforeListTable: [
        {
          path: '/payload/components/ExportCsvButton#ExportCsvButton',
          clientProps: { collection: 'subscribers' },
        },
      ],
    },
    description: tr(
      'Inscriptions à la newsletter RK Insights, avec double confirmation par e-mail. Seuls les abonnés « Confirmé » reçoivent les articles. Une inscription non confirmée est supprimée après 7 jours, un désinscrit après 30 jours.',
      'Anmeldungen zum RK Insights Newsletter mit doppelter Bestätigung per E-Mail. Nur „Bestätigt“ erhält Artikel. Unbestätigte Anmeldungen werden nach 7 Tagen, Abmeldungen nach 30 Tagen gelöscht.',
      'RK Insights newsletter sign-ups, confirmed by e-mail (double opt-in). Only "Confirmed" subscribers receive articles. Unconfirmed sign-ups are deleted after 7 days, unsubscribed addresses after 30 days.',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: tr('E-mail', 'E-Mail', 'E-mail'),
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'locale',
      type: 'select',
      label: tr('Langue des e-mails', 'Sprache der E-Mails', 'E-mail language'),
      required: true,
      defaultValue: 'en',
      options: [
        { value: 'fr', label: tr('Français', 'Französisch', 'French') },
        { value: 'de', label: tr('Allemand', 'Deutsch', 'German') },
        { value: 'en', label: tr('Anglais', 'Englisch', 'English') },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: tr('Statut', 'Status', 'Status'),
      required: true,
      defaultValue: 'pending',
      options: [
        {
          value: 'pending',
          label: tr(
            'En attente de confirmation',
            'Bestätigung ausstehend',
            'Awaiting confirmation',
          ),
        },
        { value: 'confirmed', label: tr('Confirmé', 'Bestätigt', 'Confirmed') },
        { value: 'unsubscribed', label: tr('Désinscrit', 'Abgemeldet', 'Unsubscribed') },
      ],
      admin: {
        position: 'sidebar',
        description: tr(
          'Passer à « Désinscrit » pour retirer une adresse sur demande.',
          'Auf „Abgemeldet“ setzen, um eine Adresse auf Wunsch zu entfernen.',
          'Set to "Unsubscribed" to remove an address on request.',
        ),
      },
    },
    dateField('consentAt', tr('Consentement donné le', 'Einwilligung am', 'Consent given at')),
    dateField('confirmedAt', tr('Confirmé le', 'Bestätigt am', 'Confirmed at')),
    dateField('unsubscribedAt', tr('Désinscrit le', 'Abgemeldet am', 'Unsubscribed at')),
    {
      name: 'source',
      type: 'text',
      label: tr('Formulaire d’origine', 'Herkunftsformular', 'Sign-up form'),
      admin: { readOnly: true },
    },
  ],
}
