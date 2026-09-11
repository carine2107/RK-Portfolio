import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

/**
 * PDF library: International CV, International Expert Profile, book extracts.
 * Kept separate from images so the media library stays browsable.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: tr('Document', 'Dokument', 'Document'),
    plural: tr('Documents (PDF)', 'Dokumente (PDF)', 'Documents (PDF)'),
  },
  admin: {
    group: GROUPS.library,
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: 'public/media/documents',
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Titre', 'Titel', 'Title'),
      required: true,
      localized: true,
      admin: {
        description: tr(
          'Libellé affiché sur le bouton de téléchargement.',
          'Beschriftung der Download-Schaltfläche.',
          'Label shown on the download button.',
        ),
      },
    },
    {
      name: 'kind',
      type: 'select',
      label: tr('Type de document', 'Dokumentart', 'Document type'),
      required: true,
      defaultValue: 'other',
      options: [
        {
          label: tr(
            'International Expert Profile',
            'International Expert Profile',
            'International Expert Profile',
          ),
          value: 'expert-profile',
        },
        {
          label: tr('CV international', 'Internationaler Lebenslauf', 'International CV'),
          value: 'cv',
        },
        { label: tr('Extrait de livre', 'Leseprobe', 'Book extract'), value: 'book-extract' },
        { label: tr('Autre', 'Sonstiges', 'Other'), value: 'other' },
      ],
    },
  ],
}
