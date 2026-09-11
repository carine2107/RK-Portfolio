import type { CheckboxField, Field, GroupField, TextField } from 'payload'

import { tr } from '../i18n'

/** Turns "Corporate Finance & Analysis" into "corporate-finance-analysis". */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Localised slug: each language gets its own URL segment
 * (`/en/expertise/corporate-finance`, `/fr/expertise/corporate-finance`).
 * Auto-filled from the source field when left empty.
 */
export const slugField = (from = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  label: tr('Slug (URL)', 'Slug (URL)', 'Slug (URL)'),
  required: true,
  index: true,
  localized: true,
  admin: {
    position: 'sidebar',
    description: tr(
      'Fin de l’adresse de la page. Laissez vide pour la générer depuis le titre.',
      'Ende der Seitenadresse. Leer lassen, um sie aus dem Titel zu erzeugen.',
      'URL segment. Leave empty to generate it from the title.',
    ),
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = (data as Record<string, unknown> | undefined)?.[from]
        if (typeof source === 'string' && source.length > 0) return slugify(source)
        return value
      },
    ],
  },
})

/** Per-language SEO overrides. Falls back to the page content when empty. */
export const seoField: GroupField = {
  name: 'seo',
  type: 'group',
  label: tr('Référencement (SEO)', 'Suchmaschinen (SEO)', 'SEO'),
  admin: {
    description: tr(
      'Facultatif. Sans valeur, le titre et le résumé de la fiche sont utilisés.',
      'Optional. Ohne Angabe werden Titel und Zusammenfassung des Eintrags verwendet.',
      'Optional overrides. When empty, the title and summary of the entry are used.',
    ),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Titre SEO', 'SEO-Titel', 'SEO title'),
      localized: true,
      maxLength: 70,
      admin: {
        description: tr(
          'Recommandé : 50 à 60 caractères.',
          'Empfohlen: 50–60 Zeichen.',
          'Recommended: 50–60 characters.',
        ),
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: tr('Description SEO', 'SEO-Beschreibung', 'SEO description'),
      localized: true,
      maxLength: 180,
      admin: {
        description: tr(
          'Recommandé : 120 à 160 caractères.',
          'Empfohlen: 120–160 Zeichen.',
          'Recommended: 120–160 characters.',
        ),
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: tr('Image de partage', 'Sharing-Bild', 'Sharing image'),
      admin: {
        description: tr(
          'Image affichée lors d’un partage (1200 × 630). À défaut, l’image par défaut du site est utilisée.',
          'Bild für geteilte Links (1200 × 630). Andernfalls wird das Standardbild verwendet.',
          'Social sharing image (1200×630). Falls back to the site default.',
        ),
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: tr(
        'Exclure des moteurs de recherche',
        'Von Suchmaschinen ausschließen',
        'Exclude from search engines',
      ),
      defaultValue: false,
      admin: {
        description: tr(
          'Retire la fiche des moteurs de recherche et du sitemap.',
          'Entfernt den Eintrag aus Suchmaschinen und der Sitemap.',
          'Exclude this entry from search engines and from the sitemap.',
        ),
      },
    },
  ],
}

/**
 * Marks starter/demo content shipped with the website so it can never be
 * mistaken for validated business information. The public site renders a
 * visible notice for these entries.
 */
export const placeholderField: CheckboxField = {
  name: 'isPlaceholder',
  type: 'checkbox',
  defaultValue: false,
  label: tr(
    'Contenu d’exemple (à remplacer)',
    'Beispielinhalt (zu ersetzen)',
    'Sample content (to be replaced)',
  ),
  admin: {
    position: 'sidebar',
    description: tr(
      'Coché pour les contenus de démarrage livrés avec le site. Décochez une fois les informations validées.',
      'Für die mitgelieferten Startinhalte aktiviert. Nach Freigabe der Angaben deaktivieren.',
      'Checked for the starter content delivered with the website. Uncheck once the entry contains validated information.',
    ),
  },
}

export const orderField: Field = {
  name: 'order',
  type: 'number',
  label: tr('Ordre d’affichage', 'Reihenfolge', 'Display order'),
  defaultValue: 100,
  admin: {
    position: 'sidebar',
    description: tr('Tri croissant.', 'Aufsteigende Sortierung.', 'Ascending display order.'),
  },
}

export const publishedAtField: Field = {
  name: 'publishedAt',
  type: 'date',
  label: tr('Date de publication', 'Veröffentlichungsdatum', 'Published at'),
  admin: {
    position: 'sidebar',
    date: { pickerAppearance: 'dayAndTime' },
    description: tr(
      'Une date future programme la publication de l’article.',
      'Ein zukünftiges Datum plant die Veröffentlichung.',
      'A future date schedules the publication when the entry is published.',
    ),
  },
}
