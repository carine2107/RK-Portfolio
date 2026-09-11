import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const Businesses: CollectionConfig = {
  slug: 'businesses',
  labels: {
    singular: tr('Activité', 'Unternehmung', 'Venture'),
    plural: tr('Écosystème entrepreneurial', 'Unternehmerisches Ökosystem', 'Business ecosystem'),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'name',
    defaultColumns: ['name', 'active', 'order', '_status'],
    description: tr(
      'RK Business Consulting, RK IMMO-FINANZ, KAILI Institut, KAILI Event. Décochez « Activité visible » pour masquer une activité temporairement.',
      'RK Business Consulting, RK IMMO-FINANZ, KAILI Institut, KAILI Event. „Sichtbar“ deaktivieren, um eine Aktivität vorübergehend auszublenden.',
      'RK Business Consulting, RK IMMO-FINANZ, KAILI Institut, KAILI Event. Uncheck "Active" to hide a venture temporarily.',
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
      admin: {
        description: tr(
          'Adresse complète, ou laissez vide.',
          'Vollständige Adresse oder leer lassen.',
          'Full URL, or leave empty.',
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
