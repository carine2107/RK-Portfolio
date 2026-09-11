import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { placeholderField, publishedAtField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: tr('Catégorie', 'Kategorie', 'Category'),
    plural: tr('Catégories', 'Kategorien', 'Categories'),
  },
  admin: {
    group: GROUPS.insights,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Nom', 'Name', 'Title'),
      required: true,
      localized: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
      label: tr('Description', 'Beschreibung', 'Description'),
      localized: true,
      maxLength: 200,
    },
  ],
}

/** Rough reading time, computed from the Lexical document on save. */
function countWords(node: unknown): number {
  if (!node || typeof node !== 'object') return 0
  const record = node as Record<string, unknown>
  let total = 0
  if (typeof record.text === 'string') {
    total += record.text.trim().split(/\s+/).filter(Boolean).length
  }
  const children = record.children
  if (Array.isArray(children)) {
    for (const child of children) total += countWords(child)
  }
  const root = record.root
  if (root) total += countWords(root)
  return total
}

export const Insights: CollectionConfig = {
  slug: 'insights',
  labels: {
    singular: tr('Article', 'Artikel', 'Article'),
    plural: tr('Articles RK Insights', 'RK Insights Artikel', 'RK Insights articles'),
  },
  admin: {
    group: GROUPS.insights,
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: tr(
      'Hub éditorial. Enregistrez en brouillon, prévisualisez, puis publiez ou programmez.',
      'Redaktionsbereich. Als Entwurf speichern, Vorschau ansehen, dann veröffentlichen oder planen.',
      'Editorial hub. Save as draft, preview, then publish or schedule.',
    ),
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4313'
      return `${base}/api/preview?locale=${locale ?? 'en'}&path=${encodeURIComponent(
        `/insights/${slug}`,
      )}`
    },
  },
  versions: { drafts: { autosave: false, schedulePublish: true }, maxPerDoc: 30 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const words = countWords(data?.content)
        if (words > 0) {
          data.readingTime = Math.max(1, Math.round(words / 200))
        }
        if (!data.publishedAt && data._status === 'published') {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
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
      name: 'excerpt',
      type: 'textarea',
      label: tr('Accroche', 'Teaser', 'Excerpt'),
      required: true,
      localized: true,
      maxLength: 300,
      admin: {
        description: tr(
          'Résumé utilisé dans les listes et lors des partages sur les réseaux.',
          'Kurzfassung für Listen und geteilte Links.',
          'Teaser used in listings and social cards.',
        ),
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: tr('Image de couverture', 'Titelbild', 'Cover image'),
      admin: {
        description: tr(
          'Format paysage, au moins 1600 × 900 px.',
          'Querformat, mindestens 1600 × 900 px.',
          'Landscape, at least 1600×900 px.',
        ),
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: tr('Catégorie', 'Kategorie', 'Category'),
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'text',
      label: tr('Auteur', 'Autor', 'Author'),
      defaultValue: 'Romial Kenmogne',
      admin: { position: 'sidebar' },
    },
    publishedAtField,
    {
      name: 'featured',
      type: 'checkbox',
      label: tr('Article à la une', 'Hervorgehobener Artikel', 'Featured article'),
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: tr(
          'Met l’article en avant en haut de RK Insights.',
          'Hebt den Artikel oben in RK Insights hervor.',
          'Highlight at the top of RK Insights.',
        ),
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: tr('Temps de lecture', 'Lesezeit', 'Reading time'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: tr(
          'Calculé automatiquement à l’enregistrement (en minutes).',
          'Wird beim Speichern automatisch berechnet (Minuten).',
          'Computed on save (minutes).',
        ),
      },
    },
    placeholderField,
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Article', 'Artikel', 'Article'),
          fields: [
            {
              name: 'content',
              type: 'richText',
              label: tr('Contenu', 'Inhalt', 'Content'),
              required: true,
              localized: true,
              editor: lexicalEditor({}),
            },
          ],
        },
        {
          label: tr('Liens', 'Verknüpfungen', 'Relations'),
          fields: [
            {
              name: 'relatedExpertise',
              type: 'relationship',
              relationTo: 'expertise-areas',
              hasMany: true,
              label: tr(
                'Domaines d’expertise liés',
                'Verknüpfte Kompetenzfelder',
                'Related expertise areas',
              ),
            },
            {
              name: 'relatedInsights',
              type: 'relationship',
              relationTo: 'insights',
              hasMany: true,
              label: tr('Articles liés', 'Verknüpfte Artikel', 'Related articles'),
            },
            {
              name: 'relatedBooks',
              type: 'relationship',
              relationTo: 'books',
              hasMany: true,
              label: tr('Livres liés', 'Verknüpfte Bücher', 'Related books'),
            },
          ],
        },
        { label: tr('Référencement', 'Suchmaschinen', 'SEO'), fields: [seoField] },
      ],
    },
  ],
}
