import { expect, test } from '@playwright/test'

test.describe('campaign pages', () => {
  test('an unknown campaign renders the localised 404', async ({ page }) => {
    const response = await page.goto('/fr/campaigns/campagne-inexistante')
    expect(response?.status()).toBe(404)
  })

  test('campaign pages are not listed in the navigation', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('header a[href*="/campaigns"]')).toHaveCount(0)
  })

  test('the CMS API does not expose draft campaigns', async ({ request }) => {
    const response = await request.get('/api/cms/campaigns?draft=true&where[_status][equals]=draft')
    expect(response.status()).toBe(200)
    const body = (await response.json()) as { docs: unknown[] }
    expect(body.docs).toEqual([])
  })
})
