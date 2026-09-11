'use client'

import { useFormFields, useTranslation } from '@payloadcms/ui'
import type { CSSProperties } from 'react'

import {
  deriveDarkTokens,
  deriveLightTokens,
  normalizeHex,
  resolvePalette,
  type AppearanceColors,
  type Tokens,
} from '../../lib/theme'

type Lang = 'fr' | 'de' | 'en'

const TEXT = {
  title: { fr: 'Aperçu', de: 'Vorschau', en: 'Preview' },
  light: { fr: 'Mode clair', de: 'Heller Modus', en: 'Light mode' },
  dark: { fr: 'Mode sombre', de: 'Dunkler Modus', en: 'Dark mode' },
  eyebrow: { fr: 'Europe · Afrique', de: 'Europa · Afrika', en: 'Europe · Africa' },
  headline: {
    fr: 'Consultant en business et finance',
    de: 'Business- und Finanzberater',
    en: 'Business & financial consultant',
  },
  primaryButton: { fr: 'Mes expertises', de: 'Meine Expertise', en: 'My expertise' },
  accentButton: { fr: 'Travailler avec moi', de: 'Zusammenarbeiten', en: 'Work with me' },
  section: { fr: 'Section alternée', de: 'Abwechselnder Abschnitt', en: 'Alternate section' },
  link: { fr: 'Lien', de: 'Link', en: 'Link' },
  band: { fr: 'Pied de page', de: 'Fußzeile', en: 'Footer' },
  bandSecondary: {
    fr: 'Tous droits réservés.',
    de: 'Alle Rechte vorbehalten.',
    en: 'All rights reserved.',
  },
  adjusted: {
    fr: 'Certaines couleurs ont été légèrement ajustées pour que les textes restent lisibles (contraste WCAG AA). L’aperçu montre le rendu réel.',
    de: 'Einige Farben wurden leicht angepasst, damit Texte lesbar bleiben (Kontrast WCAG AA). Die Vorschau zeigt das tatsächliche Ergebnis.',
    en: 'Some colours were slightly adjusted so that text stays readable (WCAG AA contrast). The preview shows the actual result.',
  },
  save: {
    fr: 'Enregistrez pour appliquer ces couleurs au site.',
    de: 'Speichern Sie, um diese Farben auf die Website anzuwenden.',
    en: 'Save to apply these colours to the site.',
  },
} satisfies Record<string, Record<Lang, string>>

function Mock({ tokens, title, lang }: { tokens: Tokens; title: string; lang: Lang }) {
  const v = (name: `--${string}`) => tokens[name]
  const pill: CSSProperties = {
    borderRadius: 999,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 500,
    display: 'inline-block',
  }

  return (
    <figure
      style={{
        margin: 0,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${v('--border-subtle')}`,
        background: v('--surface-base'),
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <figcaption
        style={{
          padding: '8px 16px',
          fontSize: 12,
          color: v('--text-secondary'),
          borderBottom: `1px solid ${v('--border-subtle')}`,
        }}
      >
        {title}
      </figcaption>
      <div style={{ padding: 20 }}>
        <p
          style={{
            margin: 0,
            color: v('--text-accent'),
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {TEXT.eyebrow[lang]}
        </p>
        <p
          style={{
            margin: '8px 0 0',
            color: v('--text-primary'),
            fontFamily: 'Georgia, serif',
            fontSize: 24,
          }}
        >
          Romial Kenmogne
        </p>
        <p style={{ margin: '4px 0 16px', color: v('--text-secondary'), fontSize: 14 }}>
          {TEXT.headline[lang]}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ ...pill, background: v('--surface-inverse'), color: v('--text-inverse') }}>
            {TEXT.primaryButton[lang]}
          </span>
          <span style={{ ...pill, background: v('--accent'), color: v('--accent-contrast') }}>
            {TEXT.accentButton[lang]}
          </span>
        </div>
      </div>
      <div
        style={{
          padding: '14px 20px',
          background: v('--surface-subtle'),
          color: v('--text-primary'),
          fontSize: 14,
        }}
      >
        {TEXT.section[lang]} ·{' '}
        <span style={{ color: v('--text-accent'), textDecoration: 'underline' }}>
          {TEXT.link[lang]}
        </span>
      </div>
      <div
        style={{
          padding: '14px 20px',
          background: v('--surface-contrast'),
          color: v('--text-on-contrast'),
          fontSize: 14,
          borderTop: `2px solid ${v('--accent')}`,
        }}
      >
        {TEXT.band[lang]}{' '}
        <span style={{ color: v('--text-on-contrast-secondary') }}>
          · {TEXT.bandSecondary[lang]}
        </span>
      </div>
    </figure>
  )
}

/** Live preview of the palette being edited, with the automatic contrast fixes applied. */
export function AppearancePreview() {
  const { i18n } = useTranslation()
  const lang: Lang = i18n.language === 'de' || i18n.language === 'en' ? i18n.language : 'fr'
  const fields = useFormFields(([state]) => state)
  const read = (path: string) => {
    const value = fields[path]?.value
    return typeof value === 'string' ? value : null
  }

  const input: AppearanceColors = {
    palette: (read('palette') ?? 'signature') as AppearanceColors['palette'],
    light: {
      primary: read('light.primary'),
      accent: read('light.accent'),
      background: read('light.background'),
      backgroundSubtle: read('light.backgroundSubtle'),
      textSecondary: read('light.textSecondary'),
    },
    dark: {
      background: read('dark.background'),
      backgroundSubtle: read('dark.backgroundSubtle'),
      accent: read('dark.accent'),
    },
  }

  const palette = resolvePalette(input)
  const light = deriveLightTokens(palette.light)
  const dark = deriveDarkTokens(palette.dark)

  const adjusted =
    input.palette === 'custom' &&
    (
      [
        [input.light?.primary, light['--text-primary']],
        [input.light?.primary, light['--surface-contrast']],
        [input.light?.accent, light['--accent']],
        [input.light?.textSecondary, light['--text-secondary']],
        [input.dark?.accent, dark['--accent']],
      ] as const
    ).some(([chosen, used]) => {
      const hex = normalizeHex(chosen)
      return hex !== null && hex !== used
    })

  return (
    <div className="field-type rk-appearance-preview">
      <h3 className="rk-appearance-preview__title">{TEXT.title[lang]}</h3>
      <div className="rk-appearance-preview__grid">
        <Mock tokens={light} title={TEXT.light[lang]} lang={lang} />
        <Mock tokens={dark} title={TEXT.dark[lang]} lang={lang} />
      </div>
      {adjusted ? <p className="rk-appearance-preview__note">{TEXT.adjusted[lang]}</p> : null}
      <p className="rk-appearance-preview__note">{TEXT.save[lang]}</p>
    </div>
  )
}
