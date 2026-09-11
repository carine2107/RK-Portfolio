import { readFileSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

/**
 * WCAG 2.2 contrast check on the design tokens themselves, so a palette change
 * can never silently break readability in either theme.
 */
const css = readFileSync(path.resolve(process.cwd(), 'src/app/(frontend)/globals.css'), 'utf8')

/** Reads the token values of one CSS block (light = bare `:root`, dark = `[data-theme='dark']`). */
function tokensOf(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  expect(start, `selector ${selector} not found`).toBeGreaterThan(-1)
  const blockStart = css.indexOf('{', start)
  const blockEnd = css.indexOf('\n}', blockStart)
  const block = css.slice(blockStart, blockEnd)

  const tokens: Record<string, string> = {}
  for (const match of block.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    const name = match[1]
    const value = match[2]
    if (name && value) tokens[name] = value.trim()
  }
  return tokens
}

const light = tokensOf(':root {')
const dark = tokensOf(":root[data-theme='dark']")

function resolve(tokens: Record<string, string>, name: string, depth = 0): string {
  const value = tokens[name] ?? light[name]
  if (!value) throw new Error(`Unknown token ${name}`)
  const varMatch = value.match(/^var\((--[\w-]+)\)$/)
  if (varMatch?.[1] && depth < 5) return resolve(tokens, varMatch[1], depth + 1)
  return value
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(full.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const [r = 0, g = 0, b = 0] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const first = luminance(a)
  const second = luminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Foreground / background pairs that must reach a given ratio. */
const PAIRS: { fg: string; bg: string; min: number; label: string }[] = [
  { fg: '--text-primary', bg: '--surface-base', min: 4.5, label: 'body text' },
  { fg: '--text-secondary', bg: '--surface-base', min: 4.5, label: 'secondary text' },
  { fg: '--text-secondary', bg: '--surface-subtle', min: 4.5, label: 'secondary on subtle' },
  { fg: '--text-primary', bg: '--surface-subtle', min: 4.5, label: 'title on subtle' },
  { fg: '--text-accent', bg: '--surface-base', min: 4.5, label: 'accent text' },
  { fg: '--text-accent', bg: '--surface-subtle', min: 4.5, label: 'accent on subtle' },
  { fg: '--text-accent', bg: '--surface-accent-soft', min: 4.5, label: 'accent on accent tint' },
  { fg: '--text-on-contrast', bg: '--surface-contrast', min: 4.5, label: 'text on dark band' },
  {
    fg: '--text-on-contrast-secondary',
    bg: '--surface-contrast',
    min: 4.5,
    label: 'secondary text on dark band',
  },
  { fg: '--accent', bg: '--surface-contrast', min: 3, label: 'gold accent on dark band' },
  { fg: '--accent-contrast', bg: '--accent', min: 4.5, label: 'text on gold button' },
  { fg: '--text-inverse', bg: '--surface-inverse', min: 4.5, label: 'primary button label' },
  { fg: '--state-error-text', bg: '--state-error-surface', min: 4.5, label: 'error message' },
  { fg: '--state-success-text', bg: '--state-success-surface', min: 4.5, label: 'success message' },
  { fg: '--state-warning-text', bg: '--state-warning-surface', min: 4.5, label: 'warning message' },
]

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme contrast', (themeName, tokens) => {
  for (const pair of PAIRS) {
    it(`${pair.label} reaches ${pair.min}:1`, () => {
      const ratio = contrast(resolve(tokens, pair.fg), resolve(tokens, pair.bg))
      expect(
        Number(ratio.toFixed(2)),
        `${themeName}: ${pair.fg} on ${pair.bg} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(pair.min)
    })
  }
})

describe('focus ring', () => {
  it('is visible against the page background in both themes', () => {
    expect(
      contrast(resolve(light, '--focus-ring'), resolve(light, '--surface-base')),
    ).toBeGreaterThan(3)
    expect(
      contrast(resolve(dark, '--focus-ring'), resolve(dark, '--surface-base')),
    ).toBeGreaterThan(3)
  })
})
