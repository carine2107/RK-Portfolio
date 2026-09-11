import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '../access'
import { seoField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: tr('Page À propos', 'Seite „Über mich“', 'About page'),
  admin: {
    group: GROUPS.pages,
    description: tr(
      'Biographie exécutive, parcours, vision, langues et régions.',
      'Executive Biografie, Werdegang, Vision, Sprachen und Regionen.',
      'Executive biography, career path, vision, languages and regions.',
    ),
  },
  access: { read: anyone, update: isAdminOrEditor, readVersions: isAdmin },
  versions: { drafts: false, max: 20 },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Biographie', 'Biografie', 'Biography'),
          fields: [
            {
              name: 'lead',
              type: 'textarea',
              label: tr('Chapeau', 'Einleitung', 'Lead'),
              localized: true,
              maxLength: 320,
            },
            {
              name: 'portrait',
              type: 'upload',
              relationTo: 'media',
              label: tr('Portrait', 'Porträt', 'Portrait'),
            },
            {
              name: 'biography',
              type: 'richText',
              label: tr('Biographie exécutive', 'Executive Biografie', 'Executive biography'),
              localized: true,
              editor: lexicalEditor({}),
            },
            {
              name: 'career',
              type: 'richText',
              label: tr('Parcours professionnel', 'Beruflicher Werdegang', 'Career path'),
              localized: true,
              editor: lexicalEditor({}),
            },
            {
              name: 'vision',
              type: 'richText',
              label: tr('Vision Europe–Afrique', 'Europa–Afrika-Vision', 'Europe–Africa vision'),
              localized: true,
              editor: lexicalEditor({}),
            },
            {
              name: 'values',
              type: 'array',
              localized: true,
              labels: {
                singular: tr('Valeur', 'Wert', 'Value'),
                plural: tr('Approche et valeurs', 'Ansatz und Werte', 'Approach & values'),
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
          ],
        },
        {
          label: tr('Profil', 'Profil', 'Profile facts'),
          fields: [
            {
              name: 'languages',
              type: 'array',
              labels: {
                singular: tr('Langue', 'Sprache', 'Language'),
                plural: tr('Langues', 'Sprachen', 'Languages'),
              },
              fields: [
                {
                  name: 'language',
                  type: 'text',
                  label: tr('Langue', 'Sprache', 'Language'),
                  required: true,
                  localized: true,
                },
                {
                  name: 'level',
                  type: 'text',
                  label: tr('Niveau', 'Niveau', 'Level'),
                  localized: true,
                  admin: {
                    description: tr(
                      'Par exemple « langue maternelle », « professionnel ».',
                      'Zum Beispiel „Muttersprache“, „verhandlungssicher“.',
                      'e.g. "Native", "Professional".',
                    ),
                  },
                },
              ],
            },
            {
              name: 'regions',
              type: 'array',
              labels: {
                singular: tr('Région', 'Region', 'Region'),
                plural: tr(
                  'Zones géographiques d’expérience',
                  'Regionen mit Erfahrung',
                  'Regions of experience',
                ),
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: tr('Région', 'Region', 'Region'),
                  required: true,
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
