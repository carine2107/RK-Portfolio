import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '../access'
import { seoField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: tr('Page d’accueil', 'Startseite', 'Home page'),
  admin: {
    group: GROUPS.pages,
    description: tr(
      'Hero, proposition de valeur et appel à l’action final.',
      'Hero, Nutzenversprechen und abschließender Call-to-Action.',
      'Hero, value proposition and closing call to action.',
    ),
  },
  access: { read: anyone, update: isAdminOrEditor, readVersions: isAdmin },
  versions: { drafts: false, max: 20 },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Hero', 'Hero', 'Hero'),
          fields: [
            {
              name: 'heroEyebrow',
              type: 'text',
              label: tr('Surtitre', 'Kopfzeile', 'Eyebrow'),
              localized: true,
              admin: {
                description: tr(
                  'Petite ligne au-dessus du nom, par exemple la portée géographique.',
                  'Kleine Zeile über dem Namen, z. B. die geografische Reichweite.',
                  'Small line above the name, e.g. the geographic scope.',
                ),
              },
            },
            {
              name: 'heroValueProposition',
              type: 'textarea',
              label: tr('Proposition de valeur', 'Nutzenversprechen', 'Value proposition'),
              localized: true,
              maxLength: 320,
              admin: {
                description: tr(
                  'Une phrase claire : ce que vous faites, et pour qui.',
                  'Ein klarer Satz: was Sie tun und für wen.',
                  'One clear sentence: what you do and for whom.',
                ),
              },
            },
            {
              name: 'heroPortrait',
              type: 'upload',
              relationTo: 'media',
              label: tr('Photographie du hero', 'Foto im Hero', 'Hero photograph'),
              admin: {
                description: tr(
                  'Photographie professionnelle. Tant qu’elle est absente, un emplacement élégant s’affiche — aucun portrait n’est généré.',
                  'Professionelles Foto. Solange keines hinterlegt ist, erscheint ein dezenter Platzhalter — es wird kein Porträt generiert.',
                  'Professional photograph. While empty, an elegant placeholder is displayed — no invented portrait is ever generated.',
                ),
              },
            },
            {
              name: 'heroGallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 12,
              label: tr(
                'Autres photos du hero (diaporama)',
                'Weitere Hero-Fotos (Diashow)',
                'More hero photos (slideshow)',
              ),
              admin: {
                description: tr(
                  'Facultatif. Dès qu’une photo est ajoutée ici, la photographie du hero puis ces photos défilent, dans cet ordre, en haut de la page d’accueil. Glisser-déposer pour changer l’ordre.',
                  'Optional. Sobald hier ein Foto hinzugefügt wird, laufen das Hero-Foto und dann diese Fotos in dieser Reihenfolge oben auf der Startseite durch. Reihenfolge per Drag-and-drop ändern.',
                  'Optional. As soon as a photo is added here, the hero photograph and then these photos play in this order at the top of the home page. Drag and drop to reorder.',
                ),
              },
            },
            {
              name: 'heroKeyPoints',
              type: 'array',
              localized: true,
              maxRows: 4,
              labels: {
                singular: tr('Point clé', 'Kernpunkt', 'Key point'),
                plural: tr('Points clés', 'Kernpunkte', 'Key points'),
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: tr('Libellé', 'Bezeichnung', 'Label'),
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  label: tr('Valeur', 'Wert', 'Value'),
                  required: true,
                },
              ],
              admin: {
                description: tr(
                  'Repères factuels courts (« Langues — FR / EN / DE »). N’inventez jamais de chiffres.',
                  'Kurze, belegbare Angaben („Sprachen — FR / EN / DE“). Niemals Zahlen erfinden.',
                  'Short factual markers (e.g. "Languages — FR / EN / DE"). Never invent figures.',
                ),
              },
            },
          ],
        },
        {
          label: tr('Sections', 'Abschnitte', 'Sections'),
          fields: [
            {
              name: 'expertiseIntro',
              type: 'textarea',
              label: tr(
                'Introduction — expertises',
                'Einleitung — Expertise',
                'Introduction — expertise',
              ),
              localized: true,
              maxLength: 300,
            },
            {
              name: 'experienceIntro',
              type: 'textarea',
              label: tr(
                'Introduction — expériences',
                'Einleitung — Erfahrung',
                'Introduction — experience',
              ),
              localized: true,
              maxLength: 300,
            },
            {
              name: 'ecosystemIntro',
              type: 'textarea',
              label: tr(
                'Introduction — écosystème',
                'Einleitung — Ökosystem',
                'Introduction — ecosystem',
              ),
              localized: true,
              maxLength: 300,
            },
            {
              name: 'finalCtaTitle',
              type: 'text',
              label: tr(
                'Titre de l’appel à l’action',
                'Titel des Call-to-Action',
                'Call to action title',
              ),
              localized: true,
              maxLength: 160,
            },
            {
              name: 'finalCtaBody',
              type: 'textarea',
              label: tr(
                'Texte de l’appel à l’action',
                'Text des Call-to-Action',
                'Call to action text',
              ),
              localized: true,
              maxLength: 400,
            },
          ],
        },
        { label: tr('Référencement', 'Suchmaschinen', 'SEO'), fields: [seoField] },
      ],
    },
  ],
}
