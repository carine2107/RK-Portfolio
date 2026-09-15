import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { placeholderField, publishedAtField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'
import { previewUrl } from '../preview'

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

/**
 * Sends the article to newsletter subscribers once it is published with
 * "Send to subscribers" ticked. Not awaited — saving must not wait for the
 * e-mails — and started after a short delay so the saved version is committed.
 * Scheduled articles are picked up by the background job when their date arrives.
 */
const newsletterOnPublish: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (context?.newsletterClaim) return doc
  if (!doc?.sendNewsletter || doc.newsletterSentAt || doc._status !== 'published') return doc
  const payload = req.payload
  setTimeout(() => {
    import('../../lib/newsletter')
      .then(({ sendArticleNewsletter }) => sendArticleNewsletter(payload, doc.id))
      .catch((error: unknown) =>
        payload.logger.error(
          `[newsletter] Delivery failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        ),
      )
  }, 3000)
  return doc
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
    preview: previewUrl('/insights'),
  },
  versions: { drafts: { autosave: false, schedulePublish: true }, maxPerDoc: 30 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [newsletterOnPublish],
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
    {
      name: 'sendNewsletter',
      type: 'checkbox',
      label: tr(
        'Envoyer aux abonnés de la newsletter',
        'An Newsletter-Abonnenten senden',
        'Send to newsletter subscribers',
      ),
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: tr(
          'À la publication (ou à la date programmée), l’article est envoyé une seule fois aux abonnés confirmés, dans leur langue.',
          'Bei Veröffentlichung (oder zum geplanten Datum) wird der Artikel einmalig an bestätigte Abonnenten in ihrer Sprache gesendet.',
          'On publication (or at the scheduled date) the article is sent once to confirmed subscribers, in their language.',
        ),
      },
    },
    {
      name: 'newsletterSentAt',
      type: 'date',
      label: tr('Envoyé aux abonnés le', 'An Abonnenten gesendet am', 'Sent to subscribers at'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => Boolean(data?.newsletterSentAt),
      },
    },
    {
      name: 'newsletterRecipients',
      type: 'number',
      label: tr('Destinataires', 'Empfänger', 'Recipients'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.newsletterSentAt),
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
