/**
 * Regenerates the static brand files from the monogram geometry
 * (src/lib/brand-mark.ts):
 *
 *   public/icon.svg                 favicon (blason)
 *   public/favicon.png              favicon for older browsers
 *   public/apple-icon.png           home-screen icon (full-bleed square)
 *   public/brand/*.svg              monogram and blason for print, e-mail, partners
 *   public/og-default.svg           default sharing image: the monogram replaces "RK"
 *
 *   npm run brand:assets
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

import sharp from 'sharp'

import { BRAND_COLORS, blasonSvg, markGroup, markSvg } from '../lib/brand-mark'

const publicDir = path.join(process.cwd(), 'public')
const brandDir = path.join(publicDir, 'brand')
const { navy, gold, goldLight, ivory } = BRAND_COLORS

const onLight = { stroke: navy, accent: gold }
const onDark = { stroke: ivory, accent: goldLight }
const blason = { background: navy, stroke: ivory, accent: goldLight }

async function png(svg: string, file: string, size: number) {
  await sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toFile(file)
}

async function main() {
  mkdirSync(brandDir, { recursive: true })

  const files: Record<string, string> = {
    'icon.svg': blasonSvg(blason, { title: 'Romial Kenmogne' }),
    'brand/rk-monogramme.svg': markSvg(onLight, { title: 'Romial Kenmogne' }),
    'brand/rk-monogramme-inverse.svg': markSvg(onDark, { title: 'Romial Kenmogne' }),
    'brand/rk-blason.svg': blasonSvg(blason, { title: 'Romial Kenmogne' }),
  }
  for (const [name, svg] of Object.entries(files)) {
    writeFileSync(path.join(publicDir, name), `${svg}\n`)
  }

  const faviconSize = existsSync(path.join(publicDir, 'favicon.png'))
    ? ((await sharp(path.join(publicDir, 'favicon.png')).metadata()).width ?? 48)
    : 48
  await png(blasonSvg(blason), path.join(publicDir, 'favicon.png'), faviconSize)
  await png(blasonSvg(blason, { fullBleed: true }), path.join(publicDir, 'apple-icon.png'), 180)

  // Default sharing image: swap the "RK" initials (or a previous monogram) for the monogram.
  const ogFile = path.join(publicDir, 'og-default.svg')
  const og = readFileSync(ogFile, 'utf8')
  const mark = `<g id="rk-mark">${markGroup(onDark, 'translate(104 176) scale(0.8)')}</g>`
  const updated = og.replace(/<text[^>]*>RK<\/text>|<g id="rk-mark">[\s\S]*?<\/g><\/g>/, mark)
  if (updated === og && !og.includes('id="rk-mark"'))
    throw new Error('og-default.svg: RK mark not found')
  writeFileSync(ogFile, updated)

  console.log(
    `Brand assets written: ${Object.keys(files).join(', ')}, favicon.png (${faviconSize}px), apple-icon.png, og-default.svg`,
  )
}

void main()
