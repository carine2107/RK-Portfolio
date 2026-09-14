import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

/**
 * Files of digital products (e-books, course attachments, resources).
 * Stored OUTSIDE `public/`: they are never served statically. Buyers download
 * them through /api/members/download after their purchase is checked; the CMS
 * file route itself is restricted to staff.
 */
export const ProtectedFiles: CollectionConfig = {
  slug: 'protected-files',
  labels: {
    singular: tr('Fichier protégé', 'Geschützte Datei', 'Protected file'),
    plural: tr('Fichiers protégés', 'Geschützte Dateien', 'Protected files'),
  },
  admin: {
    group: GROUPS.shop,
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'filesize', 'updatedAt'],
    description: tr(
      'Fichiers vendus (PDF, EPUB, ZIP, Word, Excel, PowerPoint). Jamais accessibles publiquement : seuls les acheteurs connectés peuvent les télécharger.',
      'Verkaufte Dateien (PDF, EPUB, ZIP, Word, Excel, PowerPoint). Nie öffentlich zugänglich: Nur angemeldete Käufer können sie herunterladen.',
      'Sold files (PDF, EPUB, ZIP, Word, Excel, PowerPoint). Never publicly accessible: only signed-in buyers can download them.',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: 'private/files',
    mimeTypes: [
      'application/pdf',
      'application/epub+zip',
      'application/zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Titre interne', 'Interner Titel', 'Internal title'),
      required: true,
    },
  ],
}
