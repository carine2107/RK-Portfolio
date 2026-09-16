/**
 * Regenerates the brand image files from the logo geometry (src/lib/brand-mark.ts).
 *
 * The letters use Playfair Display: each file is rendered in Chromium with the
 * real font (loaded from Google Fonts at generation time), so the images are
 * identical everywhere, whatever fonts the viewer has.
 *
 *   public/favicon.png               browser tab icon, 48 px
 *   public/icon-512.png              icon for installs and search results
 *   public/apple-icon.png            home-screen icon, 180 px
 *   public/og-default.png            default sharing image, 1200 × 630
 *   public/brand/rk-logo.png         logo for light backgrounds, 1024 px, transparent
 *   public/brand/rk-logo-inverse.png logo for dark backgrounds, 1024 px, transparent
 *   public/brand/rk-logo-navy.png    logo on the navy brand colour, 1024 px
 *
 *   npm run brand:assets
 */
import { mkdirSync } from 'fs'
import path from 'path'

import { chromium, type Page } from '@playwright/test'

import { BRAND_COLORS, markSvg } from '../lib/brand-mark'

const publicDir = path.join(process.cwd(), 'public')
const { navy, gold, goldLight, cream } = BRAND_COLORS

const FONTS =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500&display=block'

const onLight = { primary: navy, accent: gold }
const onDark = { primary: cream, accent: goldLight }

async function render(
  page: Page,
  file: string,
  {
    width,
    height,
    body,
    transparent = false,
  }: { width: number; height: number; body: string; transparent?: boolean },
) {
  await page.setViewportSize({ width, height })
  await page.setContent(
    `<!doctype html><html><head><link rel="stylesheet" href="${FONTS}"><style>
      html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: ${transparent ? 'transparent' : navy}; }
      svg { display: block; }
    </style></head><body>${body}</body></html>`,
    { waitUntil: 'networkidle' },
  )
  const loaded = await page.evaluate(async () => {
    const faces = await document.fonts.load('600 64px "Playfair Display"')
    await document.fonts.ready
    return faces.length > 0
  })
  if (!loaded) throw new Error('Playfair Display could not be loaded: check the network connection')
  await page.screenshot({
    path: path.join(publicDir, file),
    omitBackground: transparent,
    clip: { x: 0, y: 0, width, height },
  })
}

/** The logo centred on a square, at `scale` of the side. */
const square = (size: number, colors: { primary: string; accent: string }, scale: number) => {
  const mark = Math.round(size * scale)
  const offset = Math.round((size - mark) / 2)
  return `<div style="position:absolute;left:${offset}px;top:${offset}px">${markSvg(colors, { size: mark })}</div>`
}

async function main() {
  mkdirSync(path.join(publicDir, 'brand'), { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: 1 })

  await render(page, 'brand/rk-logo.png', {
    width: 1024,
    height: 1024,
    transparent: true,
    body: square(1024, onLight, 0.94),
  })
  await render(page, 'brand/rk-logo-inverse.png', {
    width: 1024,
    height: 1024,
    transparent: true,
    body: square(1024, onDark, 0.94),
  })
  await render(page, 'brand/rk-logo-navy.png', {
    width: 1024,
    height: 1024,
    body: square(1024, onDark, 0.8),
  })
  await render(page, 'icon-512.png', { width: 512, height: 512, body: square(512, onDark, 0.82) })
  await render(page, 'apple-icon.png', { width: 180, height: 180, body: square(180, onDark, 0.8) })
  await render(page, 'favicon.png', { width: 48, height: 48, body: square(48, onDark, 0.92) })

  await render(page, 'og-default.png', {
    width: 1200,
    height: 630,
    body: `
      <div style="position:absolute;inset:72px;border:1.5px solid rgb(184 146 75 / 0.5)"></div>
      <div style="position:absolute;left:112px;top:110px">${markSvg(onDark, { size: 136 })}</div>
      <div style="position:absolute;left:112px;top:280px;font:400 62px 'Source Serif 4', Georgia, serif;color:#ffffff">Romial Kenmogne</div>
      <div style="position:absolute;left:112px;top:366px;font:400 26px Inter, Arial, sans-serif;color:#c3cddb">Business &amp; Financial Consultant | Project Manager</div>
      <div style="position:absolute;left:112px;top:438px;font:400 24px 'Source Serif 4', Georgia, serif;color:${gold}">Understand Money. Build Businesses. Invest. Create Wealth.</div>
      <div style="position:absolute;left:112px;top:494px;font:500 20px Inter, Arial, sans-serif;letter-spacing:4px;color:#c3cddb">EUROPE · AFRICA · INTERNATIONAL</div>`,
  })

  await browser.close()
  console.log(
    'Brand assets written: favicon.png, icon-512.png, apple-icon.png, og-default.png, brand/rk-logo.png, brand/rk-logo-inverse.png, brand/rk-logo-navy.png',
  )
}

void main()
