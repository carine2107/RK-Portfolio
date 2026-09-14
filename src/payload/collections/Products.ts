import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { parseVideoUrl } from '../../lib/video'
import { isAdminOrEditor, isStaffFieldLevel, publishedOrSignedIn } from '../access'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const PRODUCT_TYPES = ['ebook', 'course', 'resource'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

const staffOnly = { read: isStaffFieldLevel }

const videoValidation: TextFieldSingleValidation = (value) =>
  !value || parseVideoUrl(value) ? true : 'YouTube / Vimeo'

/**
 * Digital products sold on the site: e-books, KAILI Institut courses and
 * downloadable resources. Buying one gives the buyer's member account access
 * to it. Files and lesson contents are readable by staff only through the
 * API; buyers reach them through the member area after an access check.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: tr('Produit numérique', 'Digitales Produkt', 'Digital product'),
    plural: tr('Produits numériques', 'Digitale Produkte', 'Digital products'),
  },
  admin: {
    group: GROUPS.shop,
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'price', '_status'],
    description: tr(
      'E-books, formations KAILI Institut et ressources. Prix TTC en EUR. L’achat donne accès au produit dans l’espace membre de l’acheteur (connexion par lien e-mail). Vendus uniquement quand la boutique est ouverte et les paiements configurés.',
      'E-Books, KAILI Institut Kurse und Ressourcen. Bruttopreise in EUR. Der Kauf schaltet das Produkt im Mitgliederbereich des Käufers frei (Anmeldung per E-Mail-Link). Verkauf nur bei geöffnetem Shop und eingerichteter Zahlung.',
      'E-books, KAILI Institut courses and resources. Gross prices in EUR. Buying unlocks the product in the buyer’s member area (sign-in by e-mail link). Sold only when the shop is open and payments are configured.',
    ),
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
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
      label: tr('Titre', 'Titel', 'Title'),
      required: true,
      localized: true,
    },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: tr('Type', 'Art', 'Type'),
          required: true,
          defaultValue: 'ebook',
          options: [
            { value: 'ebook', label: tr('E-book', 'E-Book', 'E-book') },
            { value: 'course', label: tr('Formation', 'Kurs', 'Course') },
            {
              value: 'resource',
              label: tr('Ressource téléchargeable', 'Download-Ressource', 'Downloadable resource'),
            },
          ],
        },
        {
          name: 'price',
          type: 'number',
          label: tr('Prix TTC (EUR)', 'Bruttopreis (EUR)', 'Price incl. VAT (EUR)'),
          required: true,
          min: 0.5,
          admin: { step: 0.1 },
        },
        {
          name: 'available',
          type: 'checkbox',
          label: tr('En vente', 'Im Verkauf', 'On sale'),
          defaultValue: true,
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: tr('Résumé', 'Zusammenfassung', 'Summary'),
      required: true,
      localized: true,
      maxLength: 300,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: tr('Visuel', 'Bild', 'Visual'),
    },
    {
      name: 'languages',
      type: 'select',
      hasMany: true,
      label: tr('Langue(s) du contenu', 'Sprache(n) des Inhalts', 'Content language(s)'),
      options: [
        { value: 'fr', label: tr('Français', 'Französisch', 'French') },
        { value: 'de', label: tr('Allemand', 'Deutsch', 'German') },
        { value: 'en', label: tr('Anglais', 'Englisch', 'English') },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: tr('Présentation', 'Beschreibung', 'Description'),
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'ebookPdf',
      type: 'upload',
      relationTo: 'protected-files',
      label: tr('Fichier PDF', 'PDF-Datei', 'PDF file'),
      access: staffOnly,
      admin: { condition: (data) => data?.type === 'ebook' },
    },
    {
      name: 'ebookEpub',
      type: 'upload',
      relationTo: 'protected-files',
      label: tr('Fichier EPUB', 'EPUB-Datei', 'EPUB file'),
      access: staffOnly,
      admin: { condition: (data) => data?.type === 'ebook' },
    },
    {
      name: 'resourceFile',
      type: 'upload',
      relationTo: 'protected-files',
      label: tr('Fichier de la ressource', 'Datei der Ressource', 'Resource file'),
      access: staffOnly,
      admin: { condition: (data) => data?.type === 'resource' },
    },
    {
      name: 'modules',
      type: 'array',
      labels: {
        singular: tr('Module', 'Modul', 'Module'),
        plural: tr('Modules de la formation', 'Kursmodule', 'Course modules'),
      },
      admin: {
        condition: (data) => data?.type === 'course',
        description: tr(
          'Les titres des modules et leçons sont visibles sur la fiche publique (programme) ; le contenu, la vidéo et la pièce jointe ne le sont que pour les acheteurs.',
          'Modul- und Lektionstitel sind auf der öffentlichen Seite sichtbar (Programm); Inhalt, Video und Anhang nur für Käufer.',
          'Module and lesson titles show on the public page (syllabus); content, video and attachment only for buyers.',
        ),
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: tr('Titre du module', 'Modultitel', 'Module title'),
          required: true,
          localized: true,
        },
        {
          name: 'lessons',
          type: 'array',
          labels: {
            singular: tr('Leçon', 'Lektion', 'Lesson'),
            plural: tr('Leçons', 'Lektionen', 'Lessons'),
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: tr('Titre de la leçon', 'Titel der Lektion', 'Lesson title'),
                  required: true,
                  localized: true,
                },
                {
                  name: 'durationMinutes',
                  type: 'number',
                  label: tr('Durée (min)', 'Dauer (Min.)', 'Duration (min)'),
                  min: 1,
                },
              ],
            },
            {
              name: 'content',
              type: 'richText',
              label: tr('Contenu', 'Inhalt', 'Content'),
              localized: true,
              editor: lexicalEditor({}),
              access: staffOnly,
            },
            {
              name: 'videoUrl',
              type: 'text',
              label: tr(
                'Vidéo (YouTube / Vimeo non listée)',
                'Video (YouTube / Vimeo, nicht gelistet)',
                'Video (unlisted YouTube / Vimeo)',
              ),
              validate: videoValidation,
              access: staffOnly,
            },
            {
              name: 'attachment',
              type: 'upload',
              relationTo: 'protected-files',
              label: tr('Pièce jointe', 'Anhang', 'Attachment'),
              access: staffOnly,
            },
          ],
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: tr('Mettre en avant', 'Hervorheben', 'Featured'),
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    orderField,
    placeholderField,
    seoField,
  ],
}
