import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

/** Image library. Alternative text is required in every language for accessibility. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: tr('Image', 'Bild', 'Image'),
    plural: tr('Médiathèque', 'Medienbibliothek', 'Media library'),
  },
  admin: {
    group: GROUPS.library,
    description: tr(
      'Photographies et illustrations. Chaque image doit avoir un texte alternatif.',
      'Fotos und Illustrationen. Jedes Bild braucht einen Alternativtext.',
      'Photographs and illustrations. Every image needs an alternative text.',
    ),
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'portrait', width: 800, height: 1000, position: 'centre' },
      { name: 'wide', width: 1600, height: 900, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
      // Width only: keeps the original ratio, so book covers are never cropped.
      { name: 'book', width: 900 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: tr('Texte alternatif', 'Alternativtext', 'Alternative text'),
      required: true,
      localized: true,
      admin: {
        description: tr(
          'Décrivez ce que montre l’image, pour les lecteurs d’écran et les moteurs de recherche. Saisissez « - » uniquement si l’image est purement décorative.',
          'Beschreiben Sie, was das Bild zeigt — für Screenreader und Suchmaschinen. Nur bei rein dekorativen Bildern „-“ eintragen.',
          'Describe what the image shows, for screen readers and search engines. Type "-" only for a purely decorative image.',
        ),
      },
    },
    {
      name: 'credit',
      type: 'text',
      label: tr('Crédit photo', 'Bildnachweis', 'Credit'),
      admin: {
        description: tr(
          'Photographe ou source, lorsque c’est requis.',
          'Fotograf oder Quelle, sofern erforderlich.',
          'Photographer or source, when required.',
        ),
      },
    },
  ],
}
