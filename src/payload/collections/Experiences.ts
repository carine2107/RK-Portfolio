import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { COUNTRY_OPTIONS } from '../fields/countries'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const REGIONS = [
  { label: tr('Europe', 'Europa', 'Europe'), value: 'europe' },
  { label: tr('Afrique', 'Afrika', 'Africa'), value: 'africa' },
  { label: tr('International', 'International', 'International'), value: 'international' },
] as const

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: {
    singular: tr('Expérience / projet', 'Erfahrung / Projekt', 'Experience / project'),
    plural: tr('Expériences et projets', 'Erfahrungen und Projekte', 'Experience & projects'),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'organisation', 'type', 'region', '_status'],
    description: tr(
      'Missions et projets. Ne renseignez des résultats qu’une fois vérifiés.',
      'Mandate und Projekte. Ergebnisse erst nach Prüfung eintragen.',
      'Assignments and projects. Results must only be filled in once they have been verified.',
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
      name: 'type',
      type: 'select',
      label: tr('Type', 'Art', 'Type'),
      required: true,
      defaultValue: 'assignment',
      admin: { position: 'sidebar' },
      options: [
        {
          label: tr('Mission / poste', 'Mandat / Position', 'Assignment / position'),
          value: 'assignment',
        },
        {
          label: tr('Projet / programme', 'Projekt / Programm', 'Project / programme'),
          value: 'project',
        },
      ],
    },
    {
      name: 'organisation',
      type: 'text',
      label: tr('Organisation', 'Organisation', 'Organisation'),
      required: true,
      admin: {
        description: tr(
          'Nom de l’organisation. Aucun logo tiers n’est affiché sur le site.',
          'Name der Organisation. Fremde Logos werden nicht angezeigt.',
          'Organisation name. Third-party logos are never displayed.',
        ),
      },
    },
    {
      name: 'role',
      type: 'text',
      label: tr('Rôle', 'Rolle', 'Role'),
      required: true,
      localized: true,
    },
    {
      name: 'sector',
      type: 'text',
      label: tr('Secteur', 'Branche', 'Sector'),
      localized: true,
      admin: {
        description: tr(
          'Alimente le filtre par secteur, par exemple « Finances publiques ».',
          'Speist den Branchenfilter, z. B. „Öffentliche Finanzen“.',
          'Used by the sector filter, e.g. "Public finance".',
        ),
      },
    },
    {
      name: 'region',
      type: 'select',
      label: tr('Région', 'Region', 'Region'),
      required: true,
      options: [...REGIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'countries',
      type: 'array',
      labels: {
        singular: tr('Pays', 'Land', 'Country'),
        plural: tr('Pays', 'Länder', 'Countries'),
      },
      admin: {
        description: tr(
          'Choisissez le pays : il apparaît sur la carte des expériences et son nom s’affiche automatiquement dans chaque langue.',
          'Wählen Sie das Land: Es erscheint auf der Karte und sein Name wird in jeder Sprache automatisch angezeigt.',
          'Pick the country: it appears on the experience map and its name is shown automatically in each language.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'code',
              type: 'select',
              label: tr('Pays', 'Land', 'Country'),
              options: COUNTRY_OPTIONS,
            },
            {
              name: 'name',
              type: 'text',
              label: tr(
                'Nom affiché (facultatif)',
                'Angezeigter Name (optional)',
                'Displayed name (optional)',
              ),
              localized: true,
              admin: {
                description: tr(
                  'Laissez vide pour le nom officiel. À remplir pour une région ou une ville.',
                  'Leer lassen für den offiziellen Namen. Für eine Region oder Stadt ausfüllen.',
                  'Leave empty for the official name. Fill in for a region or a city.',
                ),
              },
            },
          ],
        },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      label: tr('Date de début', 'Beginn', 'Start date'),
      required: true,
      admin: { date: { pickerAppearance: 'monthOnly' } },
    },
    {
      name: 'endDate',
      type: 'date',
      label: tr('Date de fin', 'Ende', 'End date'),
      admin: {
        date: { pickerAppearance: 'monthOnly' },
        description: tr(
          'Laissez vide pour une mission en cours.',
          'Für ein laufendes Mandat leer lassen.',
          'Leave empty for an ongoing assignment.',
        ),
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: tr('Résumé', 'Zusammenfassung', 'Summary'),
      required: true,
      localized: true,
      maxLength: 320,
      admin: {
        description: tr(
          'Texte affiché dans la liste et sur les cartes.',
          'Text in der Liste und auf den Karten.',
          'Shown on the cards and in the list.',
        ),
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: tr('Afficher sur l’accueil', 'Auf der Startseite zeigen', 'Show on the home page'),
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    orderField,
    placeholderField,
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Détail', 'Details', 'Detail'),
          fields: [
            {
              name: 'context',
              type: 'richText',
              label: tr('Contexte', 'Kontext', 'Context'),
              localized: true,
              editor: lexicalEditor({}),
            },
            {
              name: 'responsibilities',
              type: 'array',
              localized: true,
              labels: {
                singular: tr('Responsabilité', 'Verantwortlichkeit', 'Responsibility'),
                plural: tr('Responsabilités', 'Verantwortlichkeiten', 'Responsibilities'),
              },
              fields: [
                { name: 'item', type: 'text', label: tr('Texte', 'Text', 'Text'), required: true },
              ],
            },
            {
              name: 'resultsValidated',
              type: 'checkbox',
              defaultValue: false,
              label: tr(
                'Résultats vérifiés et validés pour publication',
                'Ergebnisse geprüft und zur Veröffentlichung freigegeben',
                'Results verified and cleared for publication',
              ),
              admin: {
                description: tr(
                  'Les résultats ne s’affichent sur le site que si cette case est cochée. Ne publiez jamais de chiffres non vérifiés.',
                  'Ergebnisse erscheinen nur bei aktivierter Option auf der Website. Niemals ungeprüfte Zahlen veröffentlichen.',
                  'Results are only displayed on the website when this box is checked. Never publish unverified figures.',
                ),
              },
            },
            {
              name: 'results',
              type: 'array',
              localized: true,
              labels: {
                singular: tr('Résultat', 'Ergebnis', 'Result'),
                plural: tr('Résultats', 'Ergebnisse', 'Results'),
              },
              admin: { condition: (data) => Boolean(data?.resultsValidated) },
              fields: [
                { name: 'item', type: 'text', label: tr('Texte', 'Text', 'Text'), required: true },
              ],
            },
          ],
        },
        {
          label: tr('Liens', 'Verknüpfungen', 'Relations'),
          fields: [
            {
              name: 'expertiseAreas',
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
          ],
        },
        { label: tr('Référencement', 'Suchmaschinen', 'SEO'), fields: [seoField] },
      ],
    },
  ],
}
