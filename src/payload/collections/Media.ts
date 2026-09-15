import { APIError, type CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'
import { adminLanguage, IMAGE_MIME_TYPES, unsupportedImageMessage } from '../upload-messages'

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
      'Photographies et illustrations (JPG, PNG, WebP, AVIF ou SVG). Chaque image doit avoir un texte alternatif. Les vidéos ne se déposent pas ici : publiez-les sur YouTube ou Vimeo et collez leur lien dans la fiche.',
      'Fotos und Illustrationen (JPG, PNG, WebP, AVIF oder SVG). Jedes Bild braucht einen Alternativtext. Videos werden nicht hier hochgeladen: auf YouTube oder Vimeo veröffentlichen und den Link im Eintrag einfügen.',
      'Photographs and illustrations (JPG, PNG, WebP, AVIF or SVG). Every image needs an alternative text. Videos are not uploaded here: publish them on YouTube or Vimeo and paste their link into the entry.',
    ),
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    // Runs before Payload's own file check, whose message does not say what to do.
    beforeOperation: [
      ({ args, operation, req }) => {
        if (operation !== 'create' && operation !== 'update') return args
        const message = unsupportedImageMessage(
          req.file?.mimetype,
          adminLanguage(req.i18n?.language),
        )
        if (message) throw new APIError(message, 400, null, true)
        return args
      },
    ],
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: IMAGE_MIME_TYPES,
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
