import type { Field, GlobalConfig, TextFieldSingleValidation } from 'payload'

import { backgroundProblem, normalizeHex, SIGNATURE } from '../../lib/theme'
import { anyone, isAdmin } from '../access'
import { GROUPS, tr } from '../i18n'

type Lang = 'fr' | 'de' | 'en'

const language = (req: { i18n?: { language?: string } }): Lang => {
  const value = req.i18n?.language
  return value === 'de' || value === 'en' ? value : 'fr'
}

const MESSAGES = {
  hex: {
    fr: 'Couleur au format hexadécimal attendue, par exemple #10233F.',
    de: 'Farbe im Hex-Format erwartet, z. B. #10233F.',
    en: 'Hex colour expected, e.g. #10233F.',
  },
  tooDark: {
    fr: 'Trop sombre pour le fond du mode clair : choisissez une teinte claire.',
    de: 'Zu dunkel für den Hintergrund des hellen Modus: bitte einen hellen Ton wählen.',
    en: 'Too dark for the light-mode background: pick a light shade.',
  },
  tooLight: {
    fr: 'Trop clair pour le fond du mode sombre : choisissez une teinte foncée.',
    de: 'Zu hell für den Hintergrund des dunklen Modus: bitte einen dunklen Ton wählen.',
    en: 'Too light for the dark-mode background: pick a dark shade.',
  },
} satisfies Record<string, Record<Lang, string>>

/** Optional hex colour; backgrounds must also keep the light/dark character of their theme. */
const colorValidation =
  (background?: 'light' | 'dark'): TextFieldSingleValidation =>
  (value, { req }) => {
    if (!value) return true
    const hex = normalizeHex(value)
    const lang = language(req)
    if (!hex) return MESSAGES.hex[lang]
    const problem = background ? backgroundProblem(hex, background) : null
    return problem ? MESSAGES[problem][lang] : true
  }

const color = (
  name: string,
  label: ReturnType<typeof tr>,
  fallback: string,
  background?: 'light' | 'dark',
  description?: ReturnType<typeof tr>,
): Field => ({
  name,
  type: 'text',
  label,
  validate: colorValidation(background),
  // Stored as #rrggbb; an emptied field goes back to the palette default.
  hooks: { beforeChange: [({ value }) => normalizeHex(value) ?? null] },
  admin: {
    placeholder: fallback,
    description,
    components: { Field: '/payload/components/ColorField#ColorField' },
  },
})

const isCustom = (data: Record<string, unknown> | undefined) => data?.palette === 'custom'

/**
 * Appearance of the public site: palette (presets or custom colours for the
 * light and dark themes), heading font and home-page background.
 *
 * Readability is enforced by src/lib/theme.ts, which adjusts derived text
 * colours to WCAG AA whatever is chosen here. Administrators only.
 */
export const Appearance: GlobalConfig = {
  slug: 'appearance',
  label: tr('Apparence', 'Erscheinungsbild', 'Appearance'),
  admin: {
    group: GROUPS.administration,
    description: tr(
      'Couleurs, police des titres et fond de la page d’accueil du site public. Les textes restent toujours lisibles : leurs couleurs sont ajustées automatiquement (WCAG AA). Modifications visibles sur le site en quelques secondes.',
      'Farben, Überschriftenschrift und Hintergrund der Startseite der öffentlichen Website. Texte bleiben immer lesbar: Ihre Farben werden automatisch angepasst (WCAG AA). Änderungen sind nach wenigen Sekunden sichtbar.',
      'Colours, heading font and home-page background of the public site. Text always stays readable: its colours are adjusted automatically (WCAG AA). Changes show on the site within seconds.',
    ),
  },
  access: { read: anyone, update: isAdmin, readVersions: isAdmin },
  hooks: {
    afterChange: [
      async () => {
        // Pages are statically regenerated every 5 minutes; refresh them now.
        // Outside a Next.js request (seed script) there is nothing to refresh.
        try {
          const { revalidatePath } = await import('next/cache')
          revalidatePath('/', 'layout')
        } catch {
          /* not running inside Next.js */
        }
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Couleurs', 'Farben', 'Colours'),
          fields: [
            {
              name: 'palette',
              type: 'select',
              label: tr('Palette', 'Farbpalette', 'Palette'),
              required: true,
              defaultValue: 'signature',
              options: [
                {
                  value: 'signature',
                  label: tr(
                    'Signature — marine et or (par défaut)',
                    'Signature — Marineblau und Gold (Standard)',
                    'Signature — navy and gold (default)',
                  ),
                },
                {
                  value: 'ivory',
                  label: tr('Ivoire et marine', 'Elfenbein und Marine', 'Ivory and navy'),
                },
                {
                  value: 'anthracite',
                  label: tr('Anthracite et or', 'Anthrazit und Gold', 'Charcoal and gold'),
                },
                {
                  value: 'petrol',
                  label: tr(
                    'Bleu pétrole et cuivre',
                    'Petrolblau und Kupfer',
                    'Petrol blue and copper',
                  ),
                },
                {
                  value: 'forest',
                  label: tr('Vert profond et or', 'Tiefgrün und Gold', 'Deep green and gold'),
                },
                {
                  value: 'burgundy',
                  label: tr('Bordeaux et or', 'Bordeaux und Gold', 'Burgundy and gold'),
                },
                { value: 'custom', label: tr('Personnalisée', 'Individuell', 'Custom') },
              ],
              admin: {
                description: tr(
                  'Choisissez « Personnalisée » pour définir vos propres couleurs. Une couleur laissée vide reprend celle de la palette Signature.',
                  'Wählen Sie „Individuell“, um eigene Farben festzulegen. Leere Felder übernehmen die Farbe der Signature-Palette.',
                  'Choose "Custom" to set your own colours. An empty colour falls back to the Signature palette.',
                ),
              },
            },
            {
              name: 'light',
              type: 'group',
              label: tr('Mode clair', 'Heller Modus', 'Light mode'),
              admin: { condition: isCustom },
              fields: [
                {
                  type: 'row',
                  fields: [
                    color(
                      'primary',
                      tr('Couleur principale', 'Hauptfarbe', 'Main colour'),
                      SIGNATURE.light.primary,
                      undefined,
                      tr(
                        'Titres, textes, boutons et bandeaux foncés (pied de page).',
                        'Überschriften, Texte, Schaltflächen und dunkle Bänder (Fußzeile).',
                        'Headings, text, buttons and dark bands (footer).',
                      ),
                    ),
                    color(
                      'accent',
                      tr('Couleur d’accent', 'Akzentfarbe', 'Accent colour'),
                      SIGNATURE.light.accent,
                      undefined,
                      tr(
                        'Liserés, liens et boutons dorés.',
                        'Linien, Links und goldene Schaltflächen.',
                        'Rules, links and gold buttons.',
                      ),
                    ),
                    color(
                      'textSecondary',
                      tr('Texte secondaire', 'Sekundärtext', 'Secondary text'),
                      SIGNATURE.light.textSecondary,
                      undefined,
                      tr(
                        'Sous-titres et textes d’accompagnement.',
                        'Untertitel und Begleittexte.',
                        'Subtitles and supporting text.',
                      ),
                    ),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    color(
                      'background',
                      tr('Fond de page', 'Seitenhintergrund', 'Page background'),
                      SIGNATURE.light.background,
                      'light',
                    ),
                    color(
                      'backgroundSubtle',
                      tr(
                        'Fond des sections alternées',
                        'Hintergrund abwechselnder Abschnitte',
                        'Alternate section background',
                      ),
                      SIGNATURE.light.backgroundSubtle,
                      'light',
                    ),
                  ],
                },
              ],
            },
            {
              name: 'dark',
              type: 'group',
              label: tr('Mode sombre', 'Dunkler Modus', 'Dark mode'),
              admin: { condition: isCustom },
              fields: [
                {
                  type: 'row',
                  fields: [
                    color(
                      'background',
                      tr('Fond de page', 'Seitenhintergrund', 'Page background'),
                      SIGNATURE.dark.background,
                      'dark',
                    ),
                    color(
                      'backgroundSubtle',
                      tr(
                        'Fond des sections alternées',
                        'Hintergrund abwechselnder Abschnitte',
                        'Alternate section background',
                      ),
                      SIGNATURE.dark.backgroundSubtle,
                      'dark',
                    ),
                    color(
                      'accent',
                      tr('Couleur d’accent', 'Akzentfarbe', 'Accent colour'),
                      SIGNATURE.dark.accent,
                    ),
                  ],
                },
              ],
            },
            {
              name: 'preview',
              type: 'ui',
              label: tr('Aperçu', 'Vorschau', 'Preview'),
              admin: {
                components: { Field: '/payload/components/AppearancePreview#AppearancePreview' },
              },
            },
          ],
        },
        {
          label: tr('Typographie', 'Typografie', 'Typography'),
          fields: [
            {
              name: 'headingFont',
              type: 'select',
              label: tr('Police des titres', 'Schrift der Überschriften', 'Heading font'),
              required: true,
              defaultValue: 'source-serif',
              options: [
                {
                  value: 'source-serif',
                  label: tr(
                    'Source Serif 4 — classique (par défaut)',
                    'Source Serif 4 — klassisch (Standard)',
                    'Source Serif 4 — classic (default)',
                  ),
                },
                {
                  value: 'playfair',
                  label: tr(
                    'Playfair Display — élégante',
                    'Playfair Display — elegant',
                    'Playfair Display — elegant',
                  ),
                },
                {
                  value: 'inter',
                  label: tr(
                    'Inter — moderne, sans empattement',
                    'Inter — modern, serifenlos',
                    'Inter — modern, sans-serif',
                  ),
                },
              ],
              admin: {
                description: tr(
                  'Le texte courant reste en Inter pour une lecture confortable.',
                  'Der Fließtext bleibt in Inter, damit er angenehm lesbar ist.',
                  'Body text stays in Inter for comfortable reading.',
                ),
              },
            },
          ],
        },
        {
          label: tr('Page d’accueil', 'Startseite', 'Home page'),
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: tr(
                'Fond du bandeau d’accueil',
                'Hintergrund des Startbereichs',
                'Home banner background',
              ),
              fields: [
                {
                  name: 'style',
                  type: 'select',
                  label: tr('Style', 'Stil', 'Style'),
                  required: true,
                  defaultValue: 'halo',
                  options: [
                    {
                      value: 'halo',
                      label: tr(
                        'Halo doré (par défaut)',
                        'Goldener Schimmer (Standard)',
                        'Gold glow (default)',
                      ),
                    },
                    { value: 'plain', label: tr('Uni', 'Einfarbig', 'Plain') },
                    { value: 'image', label: tr('Image', 'Bild', 'Image') },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: tr('Image de fond', 'Hintergrundbild', 'Background image'),
                  admin: {
                    condition: (_, siblingData) => siblingData?.style === 'image',
                    description: tr(
                      'Photo décorative (bureau, ville, texture…), idéalement 2400 px de large. Elle est voilée de la couleur de fond pour que le texte reste lisible. N’utilisez pas de portrait généré.',
                      'Dekoratives Foto (Büro, Stadt, Textur …), idealerweise 2400 px breit. Es wird mit der Hintergrundfarbe überlagert, damit der Text lesbar bleibt. Keine generierten Porträts verwenden.',
                      'Decorative photo (office, city, texture…), ideally 2400 px wide. It is veiled with the background colour so the text stays readable. Do not use generated portraits.',
                    ),
                  },
                },
                {
                  name: 'intensity',
                  type: 'select',
                  label: tr('Visibilité de l’image', 'Sichtbarkeit des Bildes', 'Image visibility'),
                  required: true,
                  defaultValue: 'subtle',
                  options: [
                    { value: 'subtle', label: tr('Discrète', 'Dezent', 'Subtle') },
                    { value: 'visible', label: tr('Marquée', 'Deutlich', 'Visible') },
                  ],
                  admin: { condition: (_, siblingData) => siblingData?.style === 'image' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
