/**
 * The image library only takes images. Payload's own message for a refused file
 * ("The following field is invalid: file") does not say why nor what to do: a
 * clear message is shown instead, in the language of the administration.
 */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]

export type AdminLanguage = 'fr' | 'de' | 'en'

export const adminLanguage = (value: string | undefined): AdminLanguage =>
  value === 'de' || value === 'en' ? value : 'fr'

const VIDEO: Record<AdminLanguage, string> = {
  fr: 'Les vidéos ne se déposent pas dans la médiathèque. Publiez la vidéo sur YouTube ou Vimeo (« non répertoriée » si elle ne doit pas apparaître sur la chaîne), puis collez son lien dans le champ « Vidéo (YouTube ou Vimeo) » de la fiche.',
  de: 'Videos werden nicht in die Medienbibliothek hochgeladen. Veröffentlichen Sie das Video auf YouTube oder Vimeo (bei Bedarf „nicht gelistet“) und fügen Sie den Link in das Feld „Video (YouTube oder Vimeo)“ ein.',
  en: 'Videos are not uploaded to the media library. Publish the video on YouTube or Vimeo (unlisted if it must not appear on the channel), then paste its link into the "Video (YouTube or Vimeo)" field.',
}

const OTHER: Record<AdminLanguage, string> = {
  fr: 'Format non accepté : seules les images JPG, PNG, WebP, AVIF ou SVG peuvent être ajoutées.',
  de: 'Format nicht zulässig: Nur Bilder im Format JPG, PNG, WebP, AVIF oder SVG können hinzugefügt werden.',
  en: 'Unsupported format: only JPG, PNG, WebP, AVIF or SVG images can be added.',
}

/** Message for a file the image library refuses, or `null` when the file is accepted. */
export function unsupportedImageMessage(
  mimetype: string | undefined,
  language: AdminLanguage,
): string | null {
  if (!mimetype || IMAGE_MIME_TYPES.includes(mimetype)) return null
  return mimetype.startsWith('video/') ? VIDEO[language] : OTHER[language]
}
