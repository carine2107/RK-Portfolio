import { expect, test } from '@playwright/test'

test.describe('site search', () => {
  test('finds published content in the page language and highlights the words', async ({
    page,
  }) => {
    await page.goto('/en')
    await page.getByRole('link', { name: 'Search the site' }).first().click()
    await expect(page).toHaveURL(/\/en\/search$/)

    await page.getByLabel('What are you looking for?').fill('due diligence')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/\/en\/search\?q=due\+diligence/)
    await expect(page.getByText(/results? for “due diligence”/)).toBeVisible()
    const results = page.locator('main section li a')
    expect(await results.count()).toBeGreaterThan(0)
    await expect(results.first().locator('mark').first()).toBeVisible()

    const href = await results.first().getAttribute('href')
    expect(href).toMatch(/^\/en\//)
    const response = await page.request.get(href!)
    expect(response.status()).toBe(200)
  })

  test('explains a query that is too short or finds nothing, and is not indexed', async ({
    page,
  }) => {
    await page.goto('/fr/search?q=a')
    await expect(page.getByText('Saisissez au moins 2 caractères.')).toBeVisible()

    await page.goto('/de/search?q=zzqxw')
    await expect(page.getByText(/Keine Ergebnisse für „zzqxw“/)).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})
