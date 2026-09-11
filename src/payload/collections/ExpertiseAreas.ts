import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const ExpertiseAreas: CollectionConfig = {
  slug: 'expertise-areas',
  labels: {
    singular: tr('Domaine d’expertise', 'Kompetenzfeld', 'Expertise area'),
    plural: tr('Domaines d’expertise', 'Kompetenzfelder', 'Expertise areas'),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', '_status'],
    description: tr(
      'Les domaines d’intervention listés sur la page Expertises et sur l’accueil.',
      'Die Tätigkeitsfelder auf der Expertise-Seite und der Startseite.',
      'The areas of intervention listed on /expertise and on the home page.',
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
      name: 'summary',
      type: 'textarea',
      label: tr('Résumé', 'Zusammenfassung', 'Summary'),
      required: true,
      localized: true,
      maxLength: 280,
      admin: {
        description: tr(
          'Une ou deux phrases, affichées sur les cartes.',
          'Ein bis zwei Sätze, auf den Karten sichtbar.',
          'One or two sentences, shown on cards.',
        ),
      },
    },
    {
      name: 'icon',
      type: 'select',
      label: tr('Pictogramme', 'Symbol', 'Icon'),
      defaultValue: 'chart',
      admin: {
        position: 'sidebar',
        description: tr(
          'Icône affichée sur la carte du domaine.',
          'Symbol auf der Karte des Kompetenzfelds.',
          'Line icon used on the expertise cards.',
        ),
      },
      options: [
        {
          label: tr('Graphique / analyse', 'Diagramm / Analyse', 'Chart / analysis'),
          value: 'chart',
        },
        {
          label: tr('Loupe / due diligence', 'Lupe / Due Diligence', 'Magnifier / due diligence'),
          value: 'magnifier',
        },
        {
          label: tr('Croissance / développement', 'Wachstum / Entwicklung', 'Growth / development'),
          value: 'growth',
        },
        { label: tr('Plan / projet', 'Plan / Projekt', 'Plan / project'), value: 'plan' },
        {
          label: tr(
            'Étincelle / entrepreneuriat',
            'Funke / Unternehmertum',
            'Spark / entrepreneurship',
          ),
          value: 'spark',
        },
        {
          label: tr(
            'Pièces / planification financière',
            'Münzen / Finanzplanung',
            'Coins / financial planning',
          ),
          value: 'coins',
        },
        {
          label: tr('Immeuble / immobilier', 'Gebäude / Immobilien', 'Building / real estate'),
          value: 'building',
        },
        {
          label: tr('Personnes / formation', 'Personen / Weiterbildung', 'People / training'),
          value: 'people',
        },
      ],
    },
    {
      name: 'featuredOnHome',
      type: 'checkbox',
      label: tr('Afficher sur l’accueil', 'Auf der Startseite zeigen', 'Show on the home page'),
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    orderField,
    placeholderField,
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Contenu', 'Inhalt', 'Content'),
          fields: [
            {
              name: 'intro',
              type: 'richText',
              label: tr('Introduction', 'Einleitung', 'Introduction'),
              localized: true,
              editor: lexicalEditor({}),
              admin: {
                description: tr(
                  'Texte d’introduction affiché en haut de la page dédiée.',
                  'Einleitungstext oben auf der eigenen Seite.',
                  'Introduction shown at the top of the dedicated page.',
                ),
              },
            },
            {
              name: 'challenges',
              type: 'array',
              localized: true,
              labels: {
                singular: tr('Problématique', 'Fragestellung', 'Challenge'),
                plural: tr(
                  'Problématiques traitées',
                  'Behandelte Fragestellungen',
                  'Challenges addressed',
                ),
              },
              fields: [
                { name: 'item', type: 'text', label: tr('Texte', 'Text', 'Text'), required: true },
              ],
            },
            {
              name: 'services',
              type: 'array',
              localized: true,
              labels: {
                singular: tr('Prestation', 'Leistung', 'Service'),
                plural: tr('Domaines d’intervention', 'Leistungsfelder', 'Areas of intervention'),
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: tr('Titre', 'Titel', 'Title'),
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: tr('Description', 'Beschreibung', 'Description'),
                },
              ],
            },
            {
              name: 'audiences',
              type: 'array',
              localized: true,
              labels: {
                singular: tr('Public', 'Zielgruppe', 'Audience'),
                plural: tr('Publics concernés', 'Zielgruppen', 'Who it is for'),
              },
              fields: [
                { name: 'item', type: 'text', label: tr('Texte', 'Text', 'Text'), required: true },
              ],
            },
            {
              name: 'approach',
              type: 'richText',
              label: tr('Approche', 'Vorgehen', 'Approach'),
              localized: true,
              editor: lexicalEditor({}),
            },
          ],
        },
        {
          label: tr('Référencement', 'Suchmaschinen', 'SEO'),
          fields: [seoField],
        },
      ],
    },
  ],
}
