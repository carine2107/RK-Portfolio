import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { websiteUrl } from '../../lib/url'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'
import { previewUrl } from '../preview'

const websiteValidation: TextFieldSingleValidation = (value, { req }) => {
  if (!value || websiteUrl(value)) return true
  const language = req.i18n?.language
  if (language === 'de') return 'Webadresse erwartet, z. B. www.example.com'
  if (language === 'en') return 'Web address expected, e.g. www.example.com'
  return 'Adresse de site web attendue, par exemple www.exemple.com'
}

export const Businesses: CollectionConfig = {
  slug: 'businesses',
  labels: {
    singular: tr('Activité', 'Unternehmung', 'Venture'),
    plural: tr('Écosystème entrepreneurial', 'Unternehmerisches Ökosystem', 'Business ecosystem'),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'name',
    preview: previewUrl('/businesses', false),
    defaultColumns: ['name', 'active', 'order', '_status'],
    description: tr(
      'RK Business Consulting, RK IMMO-FINANZ, Kenmogne Strategic Publishing, KAILI Institut, KAILI Event. Décochez « Activité visible » pour masquer une activité temporairement.',
      'RK Business Consulting, RK IMMO-FINANZ, Kenmogne Strategic Publishing, KAILI Institut, KAILI Event. „Sichtbar“ deaktivieren, um eine Aktivität vorübergehend auszublenden.',
      'RK Business Consulting, RK IMMO-FINANZ, Kenmogne Strategic Publishing, KAILI Institut, KAILI Event. Uncheck "Active" to hide a venture temporarily.',
    ),
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', label: tr('Nom', 'Name', 'Name'), required: true },
    slugField('name'),
    {
      name: 'tagline',
      type: 'text',
      label: tr('Accroche', 'Slogan', 'Tagline'),
      localized: true,
      maxLength: 140,
    },
    {
      name: 'description',
      type: 'textarea',
      label: tr('Présentation', 'Beschreibung', 'Description'),
      required: true,
      localized: true,
      maxLength: 700,
    },
    {
      name: 'valueProposition',
      type: 'textarea',
      label: tr('Proposition de valeur', 'Nutzenversprechen', 'Value proposition'),
      localized: true,
      maxLength: 400,
    },
    {
      name: 'field',
      type: 'text',
      label: tr('Domaine', 'Bereich', 'Field'),
      localized: true,
      admin: {
        description: tr(
          'Par exemple : conseil, financement immobilier.',
          'Zum Beispiel: Beratung, Immobilienfinanzierung.',
          'e.g. Advisory, Real estate financing.',
        ),
      },
    },
    {
      name: 'audience',
      type: 'text',
      label: tr('Public cible', 'Zielgruppe', 'Audience'),
      localized: true,
    },
    {
      name: 'website',
      type: 'text',
      label: tr('Site web', 'Website', 'Website'),
      validate: websiteValidation,
      // Stored with its scheme ("www.example.com" → "https://www.example.com/").
      hooks: { beforeChange: [({ value }) => (value ? websiteUrl(value) || value : value)] },
      admin: {
        description: tr(
          'Par exemple www.exemple.com (https:// est ajouté automatiquement), ou laissez vide.',
          'Zum Beispiel www.beispiel.de (https:// wird automatisch ergänzt) oder leer lassen.',
          'For example www.example.com (https:// is added automatically), or leave empty.',
        ),
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: tr('E-mail de contact', 'Kontakt-E-Mail', 'Contact e-mail'),
    },
    { name: 'logo', type: 'upload', relationTo: 'media', label: tr('Logo', 'Logo', 'Logo') },
    {
      name: 'active',
      type: 'checkbox',
      label: tr('Activité visible', 'Sichtbar', 'Active'),
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: tr(
          'Décochez pour masquer l’activité du site public.',
          'Deaktivieren, um die Aktivität auf der Website auszublenden.',
          'Uncheck to hide from the public site.',
        ),
      },
    },
    orderField,
    placeholderField,
    seoField,
  ],
}
