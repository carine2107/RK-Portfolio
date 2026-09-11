/**
 * Appearance engine: turns the few colours an administrator picks in the CMS
 * (Appearance global) into the full set of semantic design tokens of
 * globals.css, for the light AND the dark theme.
 *
 * Readability is guaranteed by construction: every text colour is derived
 * with `ensureContrast`, which nudges it towards black or white until it
 * reaches the WCAG 2.2 AA ratio on every surface it is used on. An
 * administrator can therefore change the palette freely without being able to
 * publish an unreadable site.
 *
 * Pure module (no React, no Payload): shared by the public site, the admin
 * preview and the unit tests.
 */

export type Rgb = [number, number, number]

export const PALETTE_KEYS = [
  'signature',
  'ivory',
  'anthracite',
  'petrol',
  'forest',
  'burgundy',
] as const
export type PaletteKey = (typeof PALETTE_KEYS)[number]

export const HEADING_FONTS = ['source-serif', 'playfair', 'inter'] as const
export type HeadingFont = (typeof HEADING_FONTS)[number]

export const HERO_STYLES = ['halo', 'plain', 'image'] as const
export type HeroStyle = (typeof HERO_STYLES)[number]

export type LightColors = {
  primary: string
  accent: string
  background: string
  backgroundSubtle: string
  textSecondary: string
}

export type DarkColors = {
  background: string
  backgroundSubtle: string
  accent: string
}

export type Palette = { light: LightColors; dark: DarkColors }

/** Colours as entered in the CMS: every field is optional. */
export type AppearanceColors = {
  palette?: PaletteKey | 'custom' | null
  light?: Partial<Record<keyof LightColors, string | null>> | null
  dark?: Partial<Record<keyof DarkColors, string | null>> | null
}

/* ---------------------------------------------------------------------------
 * Palettes
 * ------------------------------------------------------------------------- */

/** The brand palette of the specification. Its tokens are hand-tuned in globals.css. */
export const SIGNATURE: Palette = {
  light: {
    primary: '#10233f',
    accent: '#b8924b',
    background: '#ffffff',
    backgroundSubtle: '#f3f5f7',
    textSecondary: '#465568',
  },
  dark: { background: '#0b1728', backgroundSubtle: '#101f35', accent: '#d0aa63' },
}

export const PALETTES: Record<PaletteKey, Palette> = {
  signature: SIGNATURE,
  ivory: {
    light: {
      primary: '#10233f',
      accent: '#a8823d',
      background: '#fbf8f2',
      backgroundSubtle: '#f2ece0',
      textSecondary: '#4f5563',
    },
    dark: SIGNATURE.dark,
  },
  anthracite: {
    light: {
      primary: '#1f2429',
      accent: '#b8924b',
      background: '#ffffff',
      backgroundSubtle: '#f4f4f2',
      textSecondary: '#4d5359',
    },
    dark: { background: '#121416', backgroundSubtle: '#1a1d20', accent: '#d0aa63' },
  },
  petrol: {
    light: {
      primary: '#0e3a43',
      accent: '#b26b3f',
      background: '#ffffff',
      backgroundSubtle: '#f1f5f5',
      textSecondary: '#3f5558',
    },
    dark: { background: '#0a1f24', backgroundSubtle: '#0f2a30', accent: '#d38d5f' },
  },
  forest: {
    light: {
      primary: '#17362b',
      accent: '#b8924b',
      background: '#ffffff',
      backgroundSubtle: '#f2f5f1',
      textSecondary: '#445449',
    },
    dark: { background: '#0d1d17', backgroundSubtle: '#13271f', accent: '#d0aa63' },
  },
  burgundy: {
    light: {
      primary: '#4a1c2a',
      accent: '#b8924b',
      background: '#ffffff',
      backgroundSubtle: '#f8f3f2',
      textSecondary: '#5b4a4f',
    },
    dark: { background: '#1c0d12', backgroundSubtle: '#26131a', accent: '#d0aa63' },
  },
}

/* ---------------------------------------------------------------------------
 * Colour maths (sRGB, WCAG 2.2 relative luminance)
 * ------------------------------------------------------------------------- */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function isHex(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value.trim())
}

/** `#abc` / `#AABBCC` → `#aabbcc`; anything else → null. */
export function normalizeHex(value: unknown): string | null {
  if (!isHex(value)) return null
  const clean = value.trim().slice(1).toLowerCase()
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean
  return `#${full}`
}

export function toRgb(hex: string): Rgb {
  const full = normalizeHex(hex) ?? '#000000'
  return [1, 3, 5].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16)) as Rgb
}

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }) as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const first = luminance(a)
  const second = luminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** Mixes `b` into `a`; `amount` = share of `b` (0 → a, 1 → b). */
export function mix(a: string, b: string, amount: number): string {
  const from = toRgb(a)
  const to = toRgb(b)
  return toHex(from.map((channel, index) => channel + ((to[index] ?? 0) - channel) * amount) as Rgb)
}

const WHITE = '#ffffff'
const BLACK = '#000000'

/** [background, minimum ratio] */
export type Constraint = [string, number]

/**
 * Returns `color`, or the closest variant of it (mixed towards black or white)
 * that meets every constraint. When no variant can, returns the variant that
 * comes closest.
 */
export function ensureContrastAll(color: string, constraints: Constraint[]): string {
  // Smallest ratio / required ratio: >= 1 means every constraint is met.
  const slack = (candidate: string) =>
    Math.min(...constraints.map(([background, min]) => contrast(candidate, background) / min))
  if (slack(color) >= 1) return color

  // Move away from the backgrounds: darker on light surfaces, lighter on dark ones.
  const target = slack(BLACK) >= slack(WHITE) ? BLACK : WHITE
  for (let step = 1; step <= 100; step += 1) {
    const candidate = mix(color, target, step / 100)
    if (slack(candidate) >= 1) return candidate
  }
  return target
}

/** `ensureContrastAll` with the same minimum against every background. */
export function ensureContrast(color: string, backgrounds: string[], min: number): string {
  return ensureContrastAll(
    color,
    backgrounds.map((background): Constraint => [background, min]),
  )
}

/**
 * A filled surface (accent button, deep band) and the text written on it. The
 * text is the dark or light candidate that reads best; if neither reaches AA
 * on the chosen colour, the colour itself is nudged. `extra` adds constraints
 * on the colour (e.g. the gold staying visible on the deep band); `min` is the
 * ratio required for the text (7 leaves room for a secondary text colour).
 */
function withLabel(
  color: string,
  labels: [string, string],
  extra: Constraint[] = [],
  min = 4.5,
): { color: string; label: string } {
  const ordered: [string, string] =
    contrast(labels[0], color) >= contrast(labels[1], color) ? labels : [labels[1], labels[0]]
  for (const label of ordered) {
    const constraints: Constraint[] = [[label, min], ...extra]
    const candidate = ensureContrastAll(color, constraints)
    if (constraints.every(([background, min]) => contrast(candidate, background) >= min)) {
      return { color: candidate, label }
    }
  }
  const label = ordered[0]
  return { color: ensureContrastAll(color, [[label, min]]), label }
}

/** The candidate that reads best on `background`. */
export function bestOn(background: string, candidates: string[]): string {
  return candidates.reduce((best, candidate) =>
    contrast(candidate, background) > contrast(best, background) ? candidate : best,
  )
}

function rgbTriplet(hex: string): string {
  return toRgb(hex).join(' ')
}

/* ---------------------------------------------------------------------------
 * Validation rules shown to the administrator
 * ------------------------------------------------------------------------- */

/** A light-theme background must stay light, a dark-theme one dark. */
export function backgroundProblem(
  hex: string,
  theme: 'light' | 'dark',
): 'tooDark' | 'tooLight' | null {
  const value = luminance(hex)
  if (theme === 'light' && value < 0.7) return 'tooDark'
  if (theme === 'dark' && value > 0.05) return 'tooLight'
  return null
}

/* ---------------------------------------------------------------------------
 * Palette resolution and token derivation
 * ------------------------------------------------------------------------- */

/** The palette actually used: a preset, or the custom colours over the signature ones. */
export function resolvePalette(input: AppearanceColors | null | undefined): Palette {
  const key = input?.palette ?? 'signature'
  if (key !== 'custom') return PALETTES[key] ?? SIGNATURE

  const pick = <T extends Record<string, string>>(
    base: T,
    values: Partial<Record<keyof T, string | null>> | null | undefined,
  ): T =>
    Object.fromEntries(
      Object.entries(base).map(([name, fallback]) => [
        name,
        normalizeHex(values?.[name as keyof T]) ?? fallback,
      ]),
    ) as T

  return { light: pick(SIGNATURE.light, input?.light), dark: pick(SIGNATURE.dark, input?.dark) }
}

export type Tokens = Record<`--${string}`, string>

export function deriveLightTokens(colors: LightColors): Tokens {
  const background = colors.background
  const subtle = colors.backgroundSubtle
  const { color: accent, label: onAccent } = withLabel(colors.accent, ['#1a1206', WHITE])

  // The deep band (footer, final CTA) uses the primary colour; it moves away
  // from the accent if needed so that gold text (eyebrows, links on hover) stays readable on it.
  const { color: band, label: onBand } = withLabel(
    colors.primary,
    ['#f4f7fb', '#10151c'],
    [[accent, 4.5]],
    7,
  )
  const bandRaised = mix(band, WHITE, 0.07)
  const accentSoft = mix(background, accent, 0.12)
  const sunken = mix(subtle, colors.primary, 0.05)

  const textPrimary = ensureContrast(colors.primary, [background, subtle, sunken], 4.5)
  const textSecondary = ensureContrast(colors.textSecondary, [background, subtle, sunken], 4.5)
  const inverseText = bestOn(textPrimary, [WHITE, '#10151c'])

  return {
    '--surface-base': background,
    '--surface-subtle': subtle,
    '--surface-raised': background,
    '--surface-sunken': sunken,
    '--surface-inverse': textPrimary,
    '--surface-inverse-subtle': mix(textPrimary, WHITE, 0.08),
    '--surface-accent-soft': accentSoft,

    '--surface-contrast': band,
    '--surface-contrast-raised': bandRaised,
    '--text-on-contrast': onBand,
    '--text-on-contrast-secondary': ensureContrast(
      mix(onBand, band, 0.24),
      [band, bandRaised],
      4.5,
    ),
    '--border-on-contrast': mix(band, onBand, 0.18),

    '--text-primary': textPrimary,
    '--text-secondary': textSecondary,
    '--text-muted': ensureContrast(mix(textSecondary, background, 0.2), [background, subtle], 4.5),
    '--text-inverse': inverseText,
    '--text-inverse-secondary': ensureContrast(
      mix(inverseText, textPrimary, 0.24),
      [textPrimary],
      4.5,
    ),
    '--text-accent': ensureContrast(accent, [background, subtle, accentSoft], 4.5),
    '--text-on-accent': onAccent,

    '--border-subtle': mix(background, colors.primary, 0.12),
    '--border-strong': mix(background, colors.primary, 0.28),
    '--border-inverse': mix(textPrimary, WHITE, 0.18),
    '--border-accent': accent,

    '--accent': accent,
    '--accent-strong': mix(accent, BLACK, 0.16),
    '--accent-contrast': onAccent,

    '--focus-ring': textPrimary,

    '--shadow-sm': `0 1px 2px rgb(${rgbTriplet(textPrimary)} / 0.06)`,
    '--shadow-md': `0 6px 20px -8px rgb(${rgbTriplet(textPrimary)} / 0.16)`,
    '--shadow-lg': `0 24px 60px -28px rgb(${rgbTriplet(textPrimary)} / 0.32)`,
  }
}

export function deriveDarkTokens(colors: DarkColors): Tokens {
  const background = colors.background
  const subtle = colors.backgroundSubtle
  const raised = mix(background, WHITE, 0.07)
  const band = mix(background, WHITE, 0.06)
  const bandRaised = mix(background, WHITE, 0.11)
  const accentSoft = mix(background, colors.accent, 0.12)
  const surfaces = [background, subtle, raised, band, bandRaised]

  const textPrimary = ensureContrast('#f2f5f9', surfaces, 7)
  const textSecondary = ensureContrast(mix(textPrimary, background, 0.3), surfaces, 4.5)
  const textAccent = ensureContrast(mix(colors.accent, WHITE, 0.1), [...surfaces, accentSoft], 4.5)
  const { color: accent, label: onAccent } = withLabel(
    colors.accent,
    [background, WHITE],
    [[band, 4.5]],
  )

  return {
    '--surface-base': background,
    '--surface-subtle': subtle,
    '--surface-raised': raised,
    '--surface-sunken': mix(background, BLACK, 0.25),
    '--surface-inverse': '#eef2f7',
    '--surface-inverse-subtle': '#dee5ee',
    '--surface-accent-soft': accentSoft,

    '--surface-contrast': band,
    '--surface-contrast-raised': bandRaised,
    '--text-on-contrast': textPrimary,
    '--text-on-contrast-secondary': textSecondary,
    '--border-on-contrast': mix(background, WHITE, 0.16),

    '--text-primary': textPrimary,
    '--text-secondary': textSecondary,
    '--text-muted': ensureContrast(mix(textPrimary, background, 0.42), surfaces, 4.5),
    '--text-inverse': background,
    '--text-inverse-secondary': ensureContrast(mix(background, '#eef2f7', 0.3), ['#eef2f7'], 4.5),
    '--text-accent': textAccent,
    '--text-on-accent': onAccent,

    '--border-subtle': mix(background, WHITE, 0.1),
    '--border-strong': mix(background, WHITE, 0.2),
    '--border-inverse': '#c9d3e0',
    '--border-accent': accent,

    '--accent': accent,
    '--accent-strong': mix(accent, WHITE, 0.2),
    '--accent-contrast': onAccent,

    '--focus-ring': textAccent,
  }
}

/* ---------------------------------------------------------------------------
 * CSS output
 * ------------------------------------------------------------------------- */

export const HEADING_FONT_VARIABLES: Record<HeadingFont, string | null> = {
  'source-serif': null, // default of globals.css
  playfair: 'var(--font-playfair)',
  inter: 'var(--font-body)',
}

function block(selector: string, tokens: Tokens): string {
  const body = Object.entries(tokens)
    .map(([name, value]) => `${name}:${value};`)
    .join('')
  return `${selector}{${body}}`
}

/**
 * CSS overriding the default tokens, or an empty string when the appearance is
 * the default one. Only values produced by this module end up in the output
 * (hex colours and fixed keywords), never raw CMS input.
 */
export function appearanceCss(
  input: (AppearanceColors & { headingFont?: HeadingFont | null }) | null | undefined,
): string {
  const rules: string[] = []
  const palette = input?.palette ?? 'signature'

  if (palette !== 'signature') {
    const resolved = resolvePalette(input)
    const light = deriveLightTokens(resolved.light)
    const dark = deriveDarkTokens(resolved.dark)
    // `:root:root` outranks the `:root` blocks of globals.css whatever the
    // order in which the stylesheets are inserted.
    rules.push(
      block(':root:root', { ...light, '--focus-ring-offset': light['--surface-base'] ?? '' }),
    )
    rules.push(
      `@media (prefers-color-scheme: dark){${block(":root:root:not([data-theme='light'])", dark)}}`,
    )
    rules.push(block(":root:root[data-theme='dark']", dark))
  }

  const font = input?.headingFont ? HEADING_FONT_VARIABLES[input.headingFont] : null
  if (font) rules.push(`:root:root{--font-display:${font};}`)

  return rules.join('')
}

/** Browser UI colour (address bar on mobile) for each theme. */
export function themeColors(input: AppearanceColors | null | undefined): {
  light: string
  dark: string
} {
  const palette = resolvePalette(input)
  return { light: palette.light.background, dark: palette.dark.background }
}
