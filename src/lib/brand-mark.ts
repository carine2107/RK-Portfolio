/**
 * Romial Kenmogne logo: a ring split in two halves around a serif R and K.
 * The R and the left half take the primary colour (navy, or cream on dark
 * grounds); the K, which overlaps the R, and the right half take the gold.
 *
 * One geometry for the site (BrandMark), the admin and the generated brand
 * files (src/scripts/build-brand-assets.ts). The letters use Playfair Display,
 * the site's alternative heading font.
 */

export const BRAND_COLORS = {
  navy: '#10233f',
  gold: '#b8924b',
  goldLight: '#d0aa63',
  cream: '#f3efe6',
} as const

export const MARK_FONT_FAMILY = "'Playfair Display', Georgia, 'Times New Roman', serif"

/** Ring halves on a 100 × 100 grid, with a small gap at the top and the bottom. */
export const MARK_RING = {
  left: 'M47 4.1A46 46 0 0 0 47 95.9',
  right: 'M53 4.1A46 46 0 0 1 53 95.9',
  width: 2,
} as const

export const MARK_LETTERS = {
  fontSize: 64,
  fontWeight: 600,
  baseline: 72,
  r: 41,
  k: 62,
} as const

/** Standalone SVG markup of the logo (brand files, admin). */
export function markSvg(
  { primary, accent }: { primary: string; accent: string },
  { size, title }: { size?: number; title?: string } = {},
): string {
  const dimensions = size ? ` width="${size}" height="${size}"` : ''
  const label = title
    ? ` role="img" aria-label="${title}"><title>${title}</title`
    : ' aria-hidden="true"'
  const letter = (x: number, fill: string, text: string) =>
    `<text x="${x}" y="${MARK_LETTERS.baseline}" text-anchor="middle" font-family="${MARK_FONT_FAMILY.replace(/"/g, "'")}" font-size="${MARK_LETTERS.fontSize}" font-weight="${MARK_LETTERS.fontWeight}" fill="${fill}">${text}</text>`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${dimensions}${label}>`,
    `<path d="${MARK_RING.left}" fill="none" stroke="${primary}" stroke-width="${MARK_RING.width}"/>`,
    `<path d="${MARK_RING.right}" fill="none" stroke="${accent}" stroke-width="${MARK_RING.width}"/>`,
    letter(MARK_LETTERS.r, primary, 'R'),
    letter(MARK_LETTERS.k, accent, 'K'),
    '</svg>',
  ].join('')
}
