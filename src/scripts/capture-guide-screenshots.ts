/**
 * Screenshots of the public site for the administrator guide (docs/images/guide/).
 * Run against a started site (production build recommended), then rebuild the PDFs:
 *
 *   npm run docs:screenshots                 → http://localhost:4313
 *   npm run docs:screenshots -- https://…    → another address
 *   npm run docs:pdf
 *
 * French, light theme, 1280 px wide. Nothing is submitted: the pages are only
 * displayed, so no contact request or subscriber is created.
 */
import { mkdirSync } from 'fs'
import path from 'path'

import { chromium, type Page } from '@playwright/test'

const baseUrl = process.argv[2] ?? 'http://localhost:4313'
const outputDir = path.join(process.cwd(), 'docs/images/guide')

type Shot = {
  file: string
  path: string
  /** Element to capture instead of the top of the page. */
  element?: (page: Page) => ReturnType<Page['locator']>
}

const SHOTS: Shot[] = [
  { file: 'accueil.jpg', path: '/fr' },
  { file: 'article.jpg', path: '/fr/insights/lire-un-bilan-sans-etre-comptable' },
  { file: 'mediatheque.jpg', path: '/fr/media' },
  { file: 'espace-membre.jpg', path: '/fr/account/login' },
  {
    file: 'contact-qualification.jpg',
    path: '/fr/contact',
    element: (page) => page.locator('form fieldset').first(),
  },
]

async function main() {
  mkdirSync(outputDir, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light',
    locale: 'fr-FR',
  })
  await context.addInitScript(() => window.localStorage.setItem('rk-theme', 'light'))
  const page = await context.newPage()

  try {
    for (const shot of SHOTS) {
      const response = await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' })
      if (!response?.ok()) throw new Error(`${shot.path}: HTTP ${response?.status()}`)
      await page.evaluate(() => document.fonts.ready)

      const file = path.join(outputDir, shot.file)
      const options = { path: file, type: 'jpeg' as const, quality: 82 }
      if (shot.element) {
        const element = shot.element(page)
        await element.scrollIntoViewIfNeeded()
        await element.screenshot(options)
      } else {
        await page.screenshot(options)
      }
      console.log(`${path.relative(process.cwd(), file)}  (${shot.path})`)
    }
  } finally {
    await browser.close()
  }
}

void main()
