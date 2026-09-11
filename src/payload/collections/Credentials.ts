import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { orderField, placeholderField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

/** Education and professional qualifications shown on the About page. */
export const Credentials: CollectionConfig = {
  slug: 'credentials',
  labels: {
    singular: tr('Formation / qualification', 'Ausbildung / Qualifikation', 'Credential'),
    plural: tr(
      'Formations et qualifications',
      'Ausbildung und Qualifikationen',
      'Education & credentials',
    ),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'institution', 'kind', 'year'],
    description: tr(
      'Diplômes et certifications. N’ajoutez que des intitulés exacts et justifiables.',
      'Abschlüsse und Zertifikate. Nur exakte und belegbare Bezeichnungen eintragen.',
      'Diplomas and certifications. Only add entries that can be evidenced — never approximate a title.',
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
    {
      name: 'title',
      type: 'text',
      label: tr('Intitulé', 'Bezeichnung', 'Title'),
      required: true,
      localized: true,
    },
    {
      name: 'institution',
      type: 'text',
      label: tr('Établissement / organisme', 'Institution / Stelle', 'Institution'),
      required: true,
    },
    {
      name: 'kind',
      type: 'select',
      label: tr('Type', 'Art', 'Type'),
      required: true,
      defaultValue: 'education',
      options: [
        { label: tr('Formation', 'Ausbildung', 'Education'), value: 'education' },
        {
          label: tr(
            'Qualification professionnelle',
            'Berufliche Qualifikation',
            'Professional credential',
          ),
          value: 'credential',
        },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'year',
      type: 'text',
      label: tr('Année ou période', 'Jahr oder Zeitraum', 'Year or period'),
      admin: {
        description: tr(
          'Par exemple « 2018 – 2020 ».',
          'Zum Beispiel „2018 – 2020“.',
          'e.g. "2018 – 2020".',
        ),
      },
    },
    { name: 'location', type: 'text', label: tr('Lieu', 'Ort', 'Location') },
    {
      name: 'description',
      type: 'textarea',
      label: tr('Description', 'Beschreibung', 'Description'),
      localized: true,
      maxLength: 300,
    },
    orderField,
    placeholderField,
  ],
}
