import { expect, test } from '@playwright/test'

/**
 * 404 pages as sent by the server, before any JavaScript runs.
 *
 * - An address that matches no route is rendered on the server by
 *   src/app/global-not-found.tsx: a complete document in the visitor's language.
 * - An unknown entry of a detail page (`notFound()` in the page) is still sent
 *   by Next.js 16 as a shell completed by JavaScript: status and noindex are
 *   checked, the content is covered by the browser tests (navigation.spec.ts).
 */
test.describe('404 sent by the server', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'HTTP checks do not depend on the browser')
  })

  const unmatched = [
    { path: '/fr/cette-page-nexiste-pas', lang: 'fr', title: 'Cette page n’existe pas' },
    { path: '/en/this-page-does-not-exist', lang: 'en', title: 'This page does not exist' },
    { path: '/de/diese-seite-gibt-es-nicht', lang: 'de', title: 'Diese Seite existiert nicht' },
  ]

  for (const { path, lang, title } of unmatched) {
    test(`${path}: complete localised document`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(404)
      const html = await response.text()
      expect(html).toMatch(new RegExp(`<html[^>]*lang="${lang}"`))
      expect(html).not.toContain('__next_error__')
      expect(html).toContain('<main id="main-content"')
      expect(html).toMatch(new RegExp(`<h1[^>]*>${title}</h1>`))
      expect(html).toMatch(/<meta name="robots" content="noindex"/)
    })
  }

  test('an unknown book keeps a 404 status and noindex', async ({ request }) => {
    const response = await request.get('/fr/books/ce-livre-nexiste-pas')
    expect(response.status()).toBe(404)
    expect(await response.text()).toMatch(/<meta name="robots" content="noindex"/)
  })
})
