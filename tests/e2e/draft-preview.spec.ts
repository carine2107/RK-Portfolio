import { readFileSync } from 'fs'

import { expect, test } from '@playwright/test'

/**
 * Draft preview on every public page type. The CMS "Preview" button goes through
 * /api/preview, which requires an administrator session; here the draft mode
 * cookie of the production build is used directly. The page must show the preview
 * banner, bypass the cache, and never leak the banner to other visitors.
 */
const EXIT_LINK = 'href="/api/preview/exit"'

test.describe('draft preview', () => {
  test.skip(process.env.E2E_PROD !== '1', 'The draft mode cookie comes from the production build')

  test('every page type renders in preview mode without affecting visitors', async ({
    request,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'HTTP check, browser-independent')

    const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8')) as {
      preview: { previewModeId: string }
    }
    const cookie = `__prerender_bypass=${manifest.preview.previewModeId}`

    const sitemap = await (await request.get('/sitemap.xml')).text()
    const details = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/fr\/[^<]+\/[^<]+)<\/loc>/g)]
      .map((match) => match[1] ?? '')
      .filter((path) => path !== '' && !path.startsWith('/fr/account'))
    const pages = [...details, '/fr/businesses']
    expect(details.length).toBeGreaterThan(0)

    for (const path of pages) {
      const preview = await request.get(path, { headers: { cookie } })
      expect(preview.status(), path).toBe(200)
      expect(preview.headers()['cache-control'], path).toContain('no-store')
      expect(await preview.text(), `${path}: preview banner`).toContain(EXIT_LINK)

      const visitor = await request.get(path)
      expect(visitor.status(), path).toBe(200)
      expect(await visitor.text(), `${path}: no banner for visitors`).not.toContain(EXIT_LINK)
    }
  })

  test('an unknown entry is still a 404 in preview mode', async ({ request, browserName }) => {
    test.skip(browserName !== 'chromium', 'HTTP check, browser-independent')
    const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8')) as {
      preview: { previewModeId: string }
    }
    const response = await request.get('/fr/books/this-book-does-not-exist', {
      headers: { cookie: `__prerender_bypass=${manifest.preview.previewModeId}` },
    })
    expect(response.status()).toBe(404)
  })
})
