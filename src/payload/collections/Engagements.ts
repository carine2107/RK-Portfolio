import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { parseVideoUrl } from '../../lib/video'
import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { COUNTRY_OPTIONS } from '../fields/countries'
import { placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const ENGAGEMENT_TYPES = [
  'conference',
  'workshop',
  'panel',
  'interview',
  'podcast',
  'video',
  'press',
] as const

export type EngagementType = (typeof ENGAGEMENT_TYPES)[number]

/** Types that are events (dated, located): exposed as schema.org Event. */
export const EVENT_TYPES: readonly EngagementType[] = ['conference', 'workshop', 'panel']

const TYPE_LABELS: Record<EngagementType, Record<string, string>> = {
  conference: tr('Conférence', 'Vortrag', 'Conference'),
  workshop: tr('Atelier', 'Workshop', 'Workshop'),
  panel: tr('Table ronde', 'Podiumsdiskussion', 'Panel'),
  interview: tr('Interview', 'Interview', 'Interview'),
  podcast: tr('Podcast', 'Podcast', 'Podcast'),
  video: tr('Vidéo', 'Video', 'Video'),
  press: tr('Presse', 'Presse', 'Press'),
}

type Lang = 'fr' | 'de' | 'en'
const language = (req: { i18n?: { language?: string } }): Lang =>
  req.i18n?.language === 'de' || req.i18n?.language === 'en' ? req.i18n.language : 'fr'

const videoValidation: TextFieldSingleValidation = (value, { req }) => {
  if (!value || parseVideoUrl(value)) return true
  return {
    fr: 'Lien YouTube ou Vimeo attendu, par exemple https://www.youtube.com/watch?v=…',
    de: 'YouTube- oder Vimeo-Link erwartet, z. B. https://www.youtube.com/watch?v=…',
    en: 'YouTube or Vimeo link expected, e.g. https://www.youtube.com/watch?v=…',
  }[language(req)]
}

const urlValidation: TextFieldSingleValidation = (value, { req }) => {
  if (!value) return true
  try {
    if (new URL(value).protocol === 'https:') return true
  } catch {
    /* invalid */
  }
  return {
    fr: 'Adresse complète en https:// attendue.',
    de: 'Vollständige Adresse mit https:// erwartet.',
    en: 'Full https:// address expected.',
  }[language(req)]
}

/**
 * Speaking & Media: conferences, workshops, panels, interviews, podcasts,
 * videos and press. Nothing is pre-filled: only real engagements are entered.
 */
export const Engagements: CollectionConfig = {
  slug: 'engagements',
  labels: {
    singular: tr('Intervention / média', 'Auftritt / Medium', 'Engagement / media'),
    plural: tr('Conférences & médias', 'Vorträge & Medien', 'Speaking & media'),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'date', '_status'],
    description: tr(
      'Conférences, ateliers, tables rondes, interviews, podcasts, vidéos et articles de presse. Page publique : Conférences & médias.',
      'Vorträge, Workshops, Podien, Interviews, Podcasts, Videos und Presseartikel. Öffentliche Seite: Vorträge & Medien.',
      'Talks, workshops, panels, interviews, podcasts, videos and press articles. Public page: Speaking & Media.',
    ),
  },
  versions: { drafts: { autosave: false, schedulePublish: true }, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  defaultSort: '-date',
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
          options: ENGAGEMENT_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
        },
        {
          name: 'date',
          type: 'date',
          label: tr('Date', 'Datum', 'Date'),
          required: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: tr(
              'Une date future classe l’intervention dans « À venir ».',
              'Ein zukünftiges Datum ordnet den Auftritt unter „Demnächst“ ein.',
              'A future date lists the engagement under "Upcoming".',
            ),
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: tr('Fin (facultatif)', 'Ende (optional)', 'End (optional)'),
          admin: { date: { pickerAppearance: 'dayAndTime' } },
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
      type: 'row',
      fields: [
        {
          name: 'eventName',
          type: 'text',
          label: tr('Événement / émission', 'Veranstaltung / Sendung', 'Event / programme'),
          localized: true,
        },
        {
          name: 'organiser',
          type: 'text',
          label: tr('Organisateur / média', 'Veranstalter / Medium', 'Organiser / outlet'),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          label: tr('Ville', 'Stadt', 'City'),
          localized: true,
          admin: {
            description: tr(
              'Laisser vide pour une intervention en ligne.',
              'Für einen Online-Auftritt leer lassen.',
              'Leave empty for an online engagement.',
            ),
          },
        },
        {
          name: 'country',
          type: 'select',
          label: tr('Pays', 'Land', 'Country'),
          options: COUNTRY_OPTIONS,
        },
      ],
    },
    {
      name: 'languages',
      type: 'select',
      hasMany: true,
      label: tr('Langue(s) de l’intervention', 'Sprache(n) des Auftritts', 'Language(s)'),
      options: [
        { value: 'fr', label: tr('Français', 'Französisch', 'French') },
        { value: 'en', label: tr('Anglais', 'Englisch', 'English') },
        { value: 'de', label: tr('Allemand', 'Deutsch', 'German') },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: tr('Image', 'Bild', 'Image'),
      admin: {
        description: tr(
          'Photo réelle de l’intervention ou visuel de l’événement (paysage). Sert aussi d’aperçu avant la lecture de la vidéo.',
          'Echtes Foto des Auftritts oder Veranstaltungsbild (Querformat). Dient auch als Vorschau vor dem Abspielen des Videos.',
          'Real photo of the engagement or event visual (landscape). Also used as the preview before the video plays.',
        ),
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: tr('Mettre en avant', 'Hervorheben', 'Featured'),
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    placeholderField,
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Description', 'Beschreibung', 'Description'),
          fields: [
            {
              name: 'description',
              type: 'richText',
              label: tr('Description détaillée', 'Ausführliche Beschreibung', 'Description'),
              localized: true,
              editor: lexicalEditor({}),
            },
          ],
        },
        {
          label: tr('Vidéo et liens', 'Video und Links', 'Video & links'),
          fields: [
            {
              name: 'videoUrl',
              type: 'text',
              label: tr(
                'Vidéo (YouTube ou Vimeo)',
                'Video (YouTube oder Vimeo)',
                'Video (YouTube or Vimeo)',
              ),
              validate: videoValidation,
              admin: {
                description: tr(
                  'Lien de la vidéo. Elle ne se charge qu’au clic du visiteur, en mode sans cookie.',
                  'Link zum Video. Es wird erst nach Klick des Besuchers geladen, ohne Cookies.',
                  'Video link. It loads only when the visitor clicks, in no-cookie mode.',
                ),
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'externalUrl',
                  type: 'text',
                  label: tr('Lien externe', 'Externer Link', 'External link'),
                  validate: urlValidation,
                  admin: {
                    description: tr(
                      'Podcast, article, page de l’événement…',
                      'Podcast, Artikel, Veranstaltungsseite …',
                      'Podcast, article, event page…',
                    ),
                  },
                },
                {
                  name: 'externalLabel',
                  type: 'text',
                  label: tr('Texte du lien', 'Linktext', 'Link text'),
                  localized: true,
                },
              ],
            },
          ],
        },
        { label: tr('Référencement', 'Suchmaschinen', 'SEO'), fields: [seoField] },
      ],
    },
  ],
}
