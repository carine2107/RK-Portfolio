import { expect, test } from '@playwright/test'

/**
 * The booking button depends on a CMS setting. Whatever its value, the site
 * must never load anything from a booking tool on its own.
 */
test.describe('appointment booking', () => {
  for (const path of ['/fr/contact', '/de/about']) {
    test(`${path} loads nothing from a booking tool before a click`, async ({ page }) => {
      const external: string[] = []
      page.on('request', (request) => {
        if (/cal\.com|calendly|bookings\.microsoft/.test(request.url()))
          external.push(request.url())
      })
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      expect(external).toEqual([])
      await expect(page.locator('iframe')).toHaveCount(0)
    })
  }

  test('a booking link, when configured, opens in a new tab and says where it leads', async ({
    page,
  }) => {
    await page.goto('/en/contact')
    const links = page.locator('main a[target="_blank"]', { hasText: /book/i })
    const count = await links.count()
    test.skip(count === 0, 'No booking link configured in the CMS')
    await expect(links.first()).toHaveAttribute('rel', /noopener/)
    await expect(links.first()).toHaveAttribute('href', /^https:\/\//)
  })
})
