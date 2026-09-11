import { describe, expect, it } from 'vitest'

import {
  appearanceCss,
  backgroundProblem,
  contrast,
  deriveDarkTokens,
  deriveLightTokens,
  ensureContrast,
  normalizeHex,
  PALETTE_KEYS,
  PALETTES,
  resolvePalette,
  SIGNATURE,
  toHex,
  type Palette,
  type Tokens,
} from '@/lib/theme'

/** Same pairs as the design-token contrast test (tests/unit/contrast.test.ts). */
const PAIRS: { fg: `--${string}`; bg: `--${string}`; min: number }[] = [
  { fg: '--text-primary', bg: '--surface-base', min: 4.5 },
  { fg: '--text-primary', bg: '--surface-subtle', min: 4.5 },
  { fg: '--text-primary', bg: '--surface-raised', min: 4.5 },
  { fg: '--text-secondary', bg: '--surface-base', min: 4.5 },
  { fg: '--text-secondary', bg: '--surface-subtle', min: 4.5 },
  { fg: '--text-muted', bg: '--surface-base', min: 4.5 },
  { fg: '--text-accent', bg: '--surface-base', min: 4.5 },
  { fg: '--text-accent', bg: '--surface-subtle', min: 4.5 },
  { fg: '--text-accent', bg: '--surface-accent-soft', min: 4.5 },
  { fg: '--text-on-contrast', bg: '--surface-contrast', min: 4.5 },
  { fg: '--text-on-contrast-secondary', bg: '--surface-contrast', min: 4.5 },
  { fg: '--accent', bg: '--surface-contrast', min: 4.5 },
  { fg: '--accent-contrast', bg: '--accent', min: 4.5 },
  { fg: '--text-inverse', bg: '--surface-inverse', min: 4.5 },
  { fg: '--focus-ring', bg: '--surface-base', min: 3 },
]

function expectReadable(tokens: Tokens, label: string) {
  for (const pair of PAIRS) {
    const fg = tokens[pair.fg]
    const bg = tokens[pair.bg]
    expect(fg, `${label}: ${pair.fg} missing`).toBeTruthy()
    expect(bg, `${label}: ${pair.bg} missing`).toBeTruthy()
    const ratio = contrast(fg!, bg!)
    expect(
      Number(ratio.toFixed(2)),
      `${label}: ${pair.fg} ${fg} on ${pair.bg} ${bg} = ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(pair.min)
  }
}

/** Deterministic pseudo-random generator, so a failure can be replayed. */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function randomColor(next: () => number): string {
  return toHex([next() * 255, next() * 255, next() * 255])
}

function randomValid(next: () => number, theme: 'light' | 'dark'): string {
  for (;;) {
    const candidate = randomColor(next)
    if (!backgroundProblem(candidate, theme)) return candidate
  }
}

describe('colour helpers', () => {
  it('normalises hex values and rejects anything else', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex(' #10233F ')).toBe('#10233f')
    expect(normalizeHex('red')).toBeNull()
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex('#fff;}body{display:none')).toBeNull()
  })

  it('ensureContrast keeps a readable colour and fixes an unreadable one', () => {
    expect(ensureContrast('#10233f', ['#ffffff'], 4.5)).toBe('#10233f')
    const fixed = ensureContrast('#d5b579', ['#ffffff'], 4.5)
    expect(contrast(fixed, '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })
})

describe('palettes', () => {
  it.each(PALETTE_KEYS)('%s is readable in both themes', (key) => {
    const palette: Palette = PALETTES[key]
    expect(backgroundProblem(palette.light.background, 'light')).toBeNull()
    expect(backgroundProblem(palette.dark.background, 'dark')).toBeNull()
    expectReadable(deriveLightTokens(palette.light), `${key} light`)
    expectReadable(deriveDarkTokens(palette.dark), `${key} dark`)
  })

  it('stays readable whatever custom colours are entered', () => {
    const next = random(20260911)
    for (let run = 0; run < 300; run += 1) {
      const light = {
        primary: randomColor(next),
        accent: randomColor(next),
        background: randomValid(next, 'light'),
        backgroundSubtle: randomValid(next, 'light'),
        textSecondary: randomColor(next),
      }
      const dark = {
        background: randomValid(next, 'dark'),
        backgroundSubtle: randomValid(next, 'dark'),
        accent: randomColor(next),
      }
      expectReadable(deriveLightTokens(light), `run ${run} light ${JSON.stringify(light)}`)
      expectReadable(deriveDarkTokens(dark), `run ${run} dark ${JSON.stringify(dark)}`)
    }
  })

  it('custom colours fall back to the signature palette when left empty', () => {
    const palette = resolvePalette({ palette: 'custom', light: { accent: '#AA3355' } })
    expect(palette.light.accent).toBe('#aa3355')
    expect(palette.light.primary).toBe(SIGNATURE.light.primary)
    expect(palette.dark).toEqual(SIGNATURE.dark)
  })
})

describe('appearance CSS', () => {
  it('is empty for the default appearance, so globals.css applies unchanged', () => {
    expect(appearanceCss(null)).toBe('')
    expect(appearanceCss({ palette: 'signature', headingFont: 'source-serif' })).toBe('')
  })

  it('overrides both themes for another palette', () => {
    const css = appearanceCss({ palette: 'forest' })
    expect(css).toContain(':root:root{')
    expect(css).toContain("[data-theme='dark']")
    expect(css).toContain('prefers-color-scheme: dark')
  })

  it('never lets raw CMS input into the stylesheet', () => {
    const css = appearanceCss({
      palette: 'custom',
      light: { primary: '#000;}body{display:none' },
    })
    expect(css).not.toContain('display:none')
  })

  it('switches the heading font', () => {
    expect(appearanceCss({ headingFont: 'playfair' })).toContain(
      '--font-display:var(--font-playfair)',
    )
  })
})
