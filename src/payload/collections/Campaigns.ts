import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig, GroupField, TextFieldSingleValidation } from 'payload'

import { resolveCampaignLink } from '../../lib/campaign-link'
import { parseVideoUrl } from '../../lib/video'
import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

type Lang = 'fr' | 'de' | 'en'
const language = (req: { i18n?: { language?: string } }): Lang =>
  req.i18n?.language === 'de' || req.i18n?.language === 'en' ? req.i18n.language : 'fr'

const hrefValidation: TextFieldSingleValidation = (value, { req, siblingData }) => {
  const label = (siblingData as { label?: unknown } | undefined)?.label
  if (!value) {
    if (typeof label === 'string' && label.trim()) {
      return {
        fr: 'Indiquez l’adresse du bouton, ou videz son texte.',
        de: 'Geben Sie das Ziel des Buttons an oder leeren Sie seinen Text.',
        en: 'Enter the button target, or clear its text.',
      }[language(req)]
    }
    return true
  }
  if (resolveCampaignLink(value)) return true
  return {
    fr: 'Page du site commençant par / (ex. /contact?type=speaking) ou adresse complète en https://.',
    de: 'Seite der Website mit / am Anfang (z. B. /contact?type=speaking) oder vollständige https://-Adresse.',
    en: 'Site page starting with / (e.g. /contact?type=speaking) or a full https:// address.',
  }[language(req)]
}

const videoValidation: TextFieldSingleValidation = (value, { req }) => {
  if (value && parseVideoUrl(value)) return true
  return {
    fr: 'Lien YouTube ou Vimeo attendu.',
    de: 'YouTube- oder Vimeo-Link erwartet.',
    en: 'YouTube or Vimeo link expected.',
  }[language(req)]
}

const link = (name: string, label: Record<string, string>): GroupField => ({
  name,
  type: 'group',
  label,
  admin: {
    description: tr(
      'Page du site (ex. /contact, /books/mon-livre, /products) ou adresse https:// externe. Laisser vide pour ne pas afficher de bouton.',
      'Seite der Website (z. B. /contact, /books/mein-buch, /products) oder externe https://-Adresse. Leer lassen, um keinen Button anzuzeigen.',
      'Site page (e.g. /contact, /books/my-book, /products) or external https:// address. Leave empty for no button.',
    ),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: tr('Texte du bouton', 'Button-Text', 'Button text'),
          localized: true,
        },
        {
          name: 'href',
          type: 'text',
          label: tr('Destination', 'Ziel', 'Target'),
          validate: hrefValidation,
        },
      ],
    },
  ],
})

const heading = {
  name: 'heading',
  type: 'text',
  label: tr('Titre de la section', 'Abschnittstitel', 'Section heading'),
  localized: true,
} as const

const hero: Block = {
  slug: 'hero',
  labels: {
    singular: tr('En-tête', 'Kopfbereich', 'Hero'),
    plural: tr('En-têtes', 'Kopfbereiche', 'Heroes'),
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: tr('Surtitre', 'Dachzeile', 'Eyebrow'),
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: tr('Titre principal', 'Haupttitel', 'Main heading'),
      localized: true,
      admin: {
        description: tr(
          'Vide = titre de la page. À placer en premier bloc : c’est le titre principal (H1).',
          'Leer = Seitentitel. Als ersten Block verwenden: Er ist die Hauptüberschrift (H1).',
          'Empty = page title. Use as the first block: it is the main heading (H1).',
        ),
      },
    },
    {
      name: 'lead',
      type: 'textarea',
      label: tr('Accroche', 'Einleitung', 'Lead'),
      localized: true,
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: tr('Image', 'Bild', 'Image') },
    link('cta', tr('Bouton', 'Button', 'Button')),
  ],
}

const text: Block = {
  slug: 'text',
  labels: { singular: tr('Texte', 'Text', 'Text'), plural: tr('Textes', 'Texte', 'Texts') },
  fields: [
    heading,
    {
      name: 'content',
      type: 'richText',
      label: tr('Contenu', 'Inhalt', 'Content'),
      localized: true,
      required: true,
      editor: lexicalEditor({}),
    },
    {
      type: 'row',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: tr('Image', 'Bild', 'Image') },
        {
          name: 'imagePosition',
          type: 'select',
          label: tr('Position de l’image', 'Bildposition', 'Image position'),
          defaultValue: 'right',
          options: [
            { value: 'right', label: tr('À droite', 'Rechts', 'Right') },
            { value: 'left', label: tr('À gauche', 'Links', 'Left') },
          ],
        },
      ],
    },
  ],
}

const features: Block = {
  slug: 'features',
  labels: {
    singular: tr('Points clés', 'Kernpunkte', 'Key points'),
    plural: tr('Points clés', 'Kernpunkte', 'Key points'),
  },
  fields: [
    heading,
    {
      name: 'intro',
      type: 'textarea',
      label: tr('Introduction', 'Einleitung', 'Introduction'),
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      label: tr('Points', 'Punkte', 'Points'),
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: tr('Titre', 'Titel', 'Title'),
          localized: true,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: tr('Texte', 'Text', 'Text'),
          localized: true,
        },
      ],
    },
  ],
}

const video: Block = {
  slug: 'video',
  labels: { singular: tr('Vidéo', 'Video', 'Video'), plural: tr('Vidéos', 'Videos', 'Videos') },
  fields: [
    heading,
    {
      name: 'videoUrl',
      type: 'text',
      label: tr(
        'Vidéo (YouTube ou Vimeo)',
        'Video (YouTube oder Vimeo)',
        'Video (YouTube or Vimeo)',
      ),
      required: true,
      validate: videoValidation,
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: tr('Image d’aperçu', 'Vorschaubild', 'Preview image'),
    },
  ],
}

const books: Block = {
  slug: 'books',
  labels: { singular: tr('Livres', 'Bücher', 'Books'), plural: tr('Livres', 'Bücher', 'Books') },
  fields: [
    heading,
    {
      name: 'books',
      type: 'relationship',
      relationTo: 'books',
      hasMany: true,
      required: true,
      label: tr('Livres présentés', 'Vorgestellte Bücher', 'Books shown'),
    },
  ],
}

const products: Block = {
  slug: 'products',
  labels: {
    singular: tr('Produits numériques', 'Digitale Produkte', 'Digital products'),
    plural: tr('Produits numériques', 'Digitale Produkte', 'Digital products'),
  },
  fields: [
    heading,
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: true,
      label: tr('Produits présentés', 'Vorgestellte Produkte', 'Products shown'),
    },
  ],
}

const faq: Block = {
  slug: 'faq',
  labels: {
    singular: tr('Questions fréquentes', 'Häufige Fragen', 'FAQ'),
    plural: tr('Questions fréquentes', 'Häufige Fragen', 'FAQ'),
  },
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      label: tr('Questions', 'Fragen', 'Questions'),
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'question',
          type: 'text',
          label: tr('Question', 'Frage', 'Question'),
          localized: true,
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: tr('Réponse', 'Antwort', 'Answer'),
          localized: true,
          required: true,
        },
      ],
    },
  ],
}

const cta: Block = {
  slug: 'cta',
  labels: {
    singular: tr('Appel à l’action', 'Handlungsaufruf', 'Call to action'),
    plural: tr('Appels à l’action', 'Handlungsaufrufe', 'Calls to action'),
  },
  fields: [
    { ...heading, required: true },
    { name: 'body', type: 'textarea', label: tr('Texte', 'Text', 'Text'), localized: true },
    link('primary', tr('Bouton principal', 'Hauptbutton', 'Primary button')),
    link('secondary', tr('Bouton secondaire', 'Zweiter Button', 'Secondary button')),
  ],
}

const newsletter: Block = {
  slug: 'newsletter',
  labels: {
    singular: tr('Inscription newsletter', 'Newsletter-Anmeldung', 'Newsletter sign-up'),
    plural: tr('Inscriptions newsletter', 'Newsletter-Anmeldungen', 'Newsletter sign-ups'),
  },
  fields: [
    {
      ...heading,
      admin: {
        description: tr(
          'Formulaire RK Insights (double opt-in). Masqué automatiquement tant que l’envoi d’e-mails n’est pas configuré.',
          'RK-Insights-Formular (Double-Opt-in). Automatisch ausgeblendet, solange der E-Mail-Versand nicht eingerichtet ist.',
          'RK Insights form (double opt-in). Hidden automatically while e-mail delivery is not configured.',
        ),
      },
    },
    { name: 'body', type: 'textarea', label: tr('Texte', 'Text', 'Text'), localized: true },
  ],
}

/**
 * Campaign pages: landing pages dedicated to a book, a programme or a mission,
 * composed from blocks in the CMS. Served at /{locale}/campaigns/{slug}.
 */
export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  labels: {
    singular: tr('Page de campagne', 'Kampagnenseite', 'Campaign page'),
    plural: tr('Pages de campagne', 'Kampagnenseiten', 'Campaign pages'),
  },
  admin: {
    group: GROUPS.pages,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: tr(
      'Pages d’atterrissage dédiées à un livre, un programme ou une mission, composées de blocs. Adresse : /fr/campaigns/<slug>. Elles n’apparaissent pas dans le menu : partagez leur lien (réseaux, e-mail, publicité).',
      'Landingpages für ein Buch, ein Programm oder eine Mission, aus Blöcken zusammengesetzt. Adresse: /de/campaigns/<slug>. Sie erscheinen nicht im Menü: Link teilen (soziale Netzwerke, E-Mail, Werbung).',
      'Landing pages dedicated to a book, a programme or a mission, built from blocks. Address: /en/campaigns/<slug>. They are not in the menu: share their link (social media, e-mail, ads).',
    ),
  },
  versions: { drafts: { autosave: false, schedulePublish: true }, maxPerDoc: 20 },
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
      label: tr('Titre de la page', 'Seitentitel', 'Page title'),
      required: true,
      localized: true,
    },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
      label: tr('Résumé', 'Zusammenfassung', 'Summary'),
      required: true,
      localized: true,
      maxLength: 300,
      admin: {
        description: tr(
          'Sert de description pour les moteurs de recherche et les partages.',
          'Dient als Beschreibung für Suchmaschinen und geteilte Links.',
          'Used as the description for search engines and shared links.',
        ),
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Contenu', 'Inhalt', 'Content'),
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: tr('Blocs de la page', 'Seitenblöcke', 'Page blocks'),
              minRows: 1,
              blocks: [hero, text, features, video, books, products, faq, cta, newsletter],
            },
          ],
        },
        { label: tr('Référencement', 'Suchmaschinen', 'SEO'), fields: [seoField] },
      ],
    },
  ],
}
