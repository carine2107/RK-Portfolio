import { expect, test } from '@playwright/test'

test.describe('speaking & media', () => {
  for (const [locale, heading] of [
    ['fr', 'Conférences & médias'],
    ['de', 'Vorträge & Medien'],
    ['en', 'Speaking & Media'],
  ] as const) {
    test(`the page is published in ${locale} and linked from the navigation`, async ({ page }) => {
      await page.goto(`/${locale}/speaking`)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      await expect(page.locator(`footer a[href="/${locale}/speaking"]`)).toHaveCount(1)
    })
  }

  test('the invitation opens the contact form with "Speaking / media" preselected', async ({
    page,
  }) => {
    await page.goto('/en/speaking')
    await page.getByRole('link', { name: 'Propose an engagement' }).click()
    await expect(page).toHaveURL(/\/en\/contact\?type=speaking$/)
    await expect(page.locator('select[name="requestType"]')).toHaveValue('speaking')
  })

  test('no third-party video frame is loaded before the visitor asks for it', async ({ page }) => {
    const external: string[] = []
    page.on('request', (request) => {
      if (/youtube|vimeo|ytimg/.test(request.url())) external.push(request.url())
    })
    await page.goto('/en/speaking')
    await page.waitForLoadState('networkidle')
    expect(external).toEqual([])
    await expect(page.locator('iframe')).toHaveCount(0)
  })

  test('the page is in the sitemap', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()
    expect(body).toContain('/en/speaking')
  })
})
