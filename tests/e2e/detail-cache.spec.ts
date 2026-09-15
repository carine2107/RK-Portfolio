import { expect, test } from '@playwright/test'

/**
 * Detail pages (article, expertise, book…) are cached and refreshed every
 * 5 minutes, like the list pages. When one is rendered on every request instead,
 * Next.js streams its metadata after the page body: crawlers outside Next.js' bot
 * list and Lighthouse then miss the meta description.
 */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

test.describe('detail pages', () => {
  test.skip(process.env.E2E_PROD !== '1', 'Caching only applies to the production build')

  test('are cached, with their meta description in the head', async ({ request, browserName }) => {
    test.skip(browserName !== 'chromium', 'HTTP check, browser-independent')

    const sitemap = await (await request.get('/sitemap.xml')).text()
    const details = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/fr\/[^<]+\/[^<]+)<\/loc>/g)]
      .map((match) => match[1] ?? '')
      .filter((path) => path !== '' && !path.startsWith('/fr/account'))
    expect(details.length).toBeGreaterThan(0)

    for (const path of details) {
      const response = await request.get(path, { headers: { 'user-agent': BROWSER_UA } })
      expect(response.status(), path).toBe(200)
      expect(response.headers()['cache-control'], path).toContain('s-maxage=300')

      const html = await response.text()
      const headEnd = html.indexOf('</head>')
      const description = html.indexOf('<meta name="description"')
      expect(description, `${path}: description in <head>`).toBeGreaterThan(-1)
      expect(description, `${path}: description in <head>`).toBeLessThan(headEnd)
    }
  })
})
