import { expect, test } from '@playwright/test'

test.describe('media library', () => {
  for (const [locale, heading] of [
    ['fr', 'Médiathèque'],
    ['de', 'Mediathek'],
    ['en', 'Media library'],
  ] as const) {
    test(`the page is published in ${locale} and linked from the footer`, async ({ page }) => {
      await page.goto(`/${locale}/media`)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      await expect(page.locator(`footer a[href="/${locale}/media"]`)).toHaveCount(1)
    })
  }

  test('the Speaking & Media page links to the library', async ({ page }) => {
    await page.goto('/en/speaking')
    await page.getByRole('link', { name: 'Browse the media library' }).click()
    await expect(page).toHaveURL(/\/en\/media$/)
  })

  test('no third-party player is loaded before the visitor asks for it', async ({ page }) => {
    const external: string[] = []
    page.on('request', (request) => {
      if (/youtube|vimeo|ytimg/.test(request.url())) external.push(request.url())
    })
    await page.goto('/en/media')
    await page.waitForLoadState('networkidle')
    expect(external).toEqual([])
    await expect(page.locator('iframe')).toHaveCount(0)
  })

  test('the page is in the sitemap', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()
    expect(body).toContain('/en/media')
  })
})
