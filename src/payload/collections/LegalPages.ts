import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '../access'
import { seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const LEGAL_PAGE_TYPES = [
  { label: tr('Impressum / mentions légales', 'Impressum', 'Imprint'), value: 'imprint' },
  {
    label: tr('Politique de confidentialité', 'Datenschutzerklärung', 'Privacy policy'),
    value: 'privacy',
  },
  { label: tr('Politique de cookies', 'Cookie-Richtlinie', 'Cookie policy'), value: 'cookies' },
  { label: tr('Conditions générales', 'AGB', 'Terms & conditions'), value: 'terms' },
  {
    label: tr('Livraison et retours', 'Lieferung und Rückgabe', 'Delivery & returns'),
    value: 'returns',
  },
] as const

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  labels: {
    singular: tr('Page légale', 'Rechtliche Seite', 'Legal page'),
    plural: tr('Pages légales', 'Rechtliche Seiten', 'Legal pages'),
  },
  admin: {
    group: GROUPS.administration,
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'needsLegalReview', '_status'],
    description: tr(
      'Trames à compléter. Le texte final doit être validé par le propriétaire et, si nécessaire, par un professionnel du droit.',
      'Zu vervollständigende Entwürfe. Der endgültige Text ist vom Inhaber und ggf. von einer Rechtsberatung freizugeben.',
      'Structural drafts. The final wording must be validated by the owner and, where required, by a legal professional.',
    ),
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdmin,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Titre', 'Titel', 'Title'),
      required: true,
      localized: true,
    },
    slugField(),
    {
      name: 'type',
      type: 'select',
      label: tr('Type de page', 'Seitentyp', 'Page type'),
      required: true,
      unique: true,
      options: [...LEGAL_PAGE_TYPES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'needsLegalReview',
      type: 'checkbox',
      defaultValue: true,
      label: tr(
        'Brouillon à faire valider juridiquement',
        'Entwurf – juristische Prüfung erforderlich',
        'Draft pending legal review',
      ),
      admin: {
        position: 'sidebar',
        description: tr(
          'Tant que la case est cochée, un bandeau prévient les visiteurs et la page est exclue des moteurs de recherche.',
          'Solange aktiviert, weist ein Hinweisbanner die Besucher darauf hin und die Seite bleibt für Suchmaschinen gesperrt.',
          'While checked, a visible notice tells visitors the text is a draft and the page stays out of search engines.',
        ),
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: tr('Contenu', 'Inhalt', 'Content'),
      required: true,
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'lastUpdated',
      type: 'date',
      label: tr('Dernière mise à jour', 'Zuletzt aktualisiert', 'Last updated'),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    seoField,
  ],
}
