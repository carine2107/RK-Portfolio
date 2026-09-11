/**
 * Visual QA helper: captures full-page screenshots of every main page, in the
 * three languages, both themes and the reference widths of the specification.
 *
 *   node tests/visual/capture.mjs [outputDir] [baseUrl]
 *
 * The screenshots are written as `<page>-<locale>-<theme>-<width>.png`. They are
 * meant to be reviewed by a human (or by an agent) — they are not compared
 * automatically, so a deliberate design change never fails a build.
 */
import { mkdir } from 'fs/promises'
import path from 'path'

import { chromium } from '@playwright/test'

const outputDir = process.argv[2] ?? 'test-results/visual'
const baseUrl = process.argv[3] ?? 'http://localhost:4313'

const PAGES = [
  ['home', ''],
  ['about', '/about'],
  ['expertise', '/expertise'],
  ['expertise-detail', '/expertise/corporate-finance'],
  ['experience', '/experience'],
  ['insights', '/insights'],
  ['books', '/books'],
  ['businesses', '/businesses'],
  ['contact', '/contact'],
  ['legal', '/legal/privacy-policy'],
  ['not-found', '/this-page-does-not-exist'],
]

/** [locale, theme, width] combinations to capture. */
const MATRIX = [
  ['en', 'light', 1440],
  ['en', 'dark', 1440],
  ['fr', 'light', 1440],
  ['de', 'dark', 1440],
  ['fr', 'light', 1024],
  ['en', 'light', 768],
  ['fr', 'dark', 375],
  ['en', 'light', 375],
  ['de', 'light', 320],
]

const run = async () => {
  await mkdir(outputDir, { recursive: true })
  const browser = await chromium.launch()

  for (const [locale, theme, width] of MATRIX) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: theme === 'dark' ? 'dark' : 'light',
      locale: locale === 'en' ? 'en-GB' : locale,
    })
    await context.addInitScript((value) => window.localStorage.setItem('rk-theme', value), theme)
    const page = await context.newPage()

    for (const [name, route] of PAGES) {
      const url = `${baseUrl}/${locale}${route}`
      await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(250)
      const file = path.join(outputDir, `${name}-${locale}-${theme}-${width}.png`)
      await page.screenshot({ path: file, fullPage: true })
      process.stdout.write(`${file}\n`)
    }

    await context.close()
  }

  await browser.close()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
