/**
 * The Romial Kenmogne monogram — single source of the logo geometry.
 *
 * "Monogramme lié": the leg of the R lands on the stem of the K; the rising
 * arm of the K carries the accent colour. Drawn with strokes on a 100 × 100
 * grid, with no font, so it renders identically everywhere (site, admin,
 * favicon, sharing image, PDF). The "blason" is the same monogram reversed
 * out of a square whose top-right corner is cut along the rising arm.
 *
 * Used by the React component (BrandMark), the admin graphics and the asset
 * scripts (`npm run brand:assets`, `npm run guide:pdf`).
 */

export const BRAND_COLORS = {
  navy: '#10233f',
  gold: '#b8924b',
  goldLight: '#d0aa63',
  ivory: '#f3efe6',
} as const

export const MARK_STROKE_WIDTH = 6.5

/** R stem, R bowl, R leg, K stem, K leg. */
export const MARK_BODY_PATHS = [
  'M21.5 18V82',
  'M21.5 21.25H36.5a14.5 14.5 0 0 1 0 29H21.5',
  'M34.5 50.25 55.5 82',
  'M57.5 18V82',
  'M64 44 79.5 82',
] as const

/** Rising arm of the K, in the accent colour. */
export const MARK_ACCENT_PATH = 'M57.5 54 79.5 18'

/** Square with the top-right corner cut, 2-unit safe margin. */
export const BLASON_PATH =
  'M22 2H80L98 20V78A20 20 0 0 1 78 98H22A20 20 0 0 1 2 78V22A20 20 0 0 1 22 2Z'

/** The monogram inside the blason: scaled to 62 % and optically centred. */
export const BLASON_INNER_TRANSFORM = 'translate(50 50) scale(0.62) translate(-50.6 -50)'

type MarkColors = { stroke: string; accent: string }

const attr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

/** `<g>` with the monogram strokes (no outer `<svg>`). */
export function markGroup({ stroke, accent }: MarkColors, transform?: string): string {
  const body = MARK_BODY_PATHS.map((d) => `<path d="${d}" stroke="${attr(stroke)}"/>`).join('')
  return (
    `<g fill="none" stroke-width="${MARK_STROKE_WIDTH}" stroke-linejoin="miter"${transform ? ` transform="${transform}"` : ''}>` +
    `${body}<path d="${MARK_ACCENT_PATH}" stroke="${attr(accent)}"/></g>`
  )
}

/** Standalone monogram SVG. */
export function markSvg(
  colors: MarkColors,
  options: { size?: number; title?: string } = {},
): string {
  const size = options.size ? ` width="${options.size}" height="${options.size}"` : ''
  const label = options.title
    ? ` role="img" aria-label="${attr(options.title)}"`
    : ' aria-hidden="true"'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${size}${label}>${markGroup(colors)}</svg>`
}

/**
 * Blason SVG. `fullBleed` paints the whole square (platforms that round or
 * mask the icon themselves, e.g. the Apple touch icon).
 */
export function blasonSvg(
  { background, stroke, accent }: MarkColors & { background: string },
  options: { size?: number; title?: string; fullBleed?: boolean } = {},
): string {
  const size = options.size ? ` width="${options.size}" height="${options.size}"` : ''
  const label = options.title
    ? ` role="img" aria-label="${attr(options.title)}"`
    : ' aria-hidden="true"'
  const shape = options.fullBleed
    ? `<rect width="100" height="100" fill="${attr(background)}"/>`
    : `<path d="${BLASON_PATH}" fill="${attr(background)}"/>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${size}${label}>` +
    `${shape}${markGroup({ stroke, accent }, BLASON_INNER_TRANSFORM)}</svg>`
  )
}
