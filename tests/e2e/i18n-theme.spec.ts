import { expect, test } from '@playwright/test'

import { languageSwitcher, themeToggle } from './helpers'

test.describe('language switching', () => {
  test('switches from English to French and stays on the equivalent page', async ({ page }) => {
    await page.goto('/en/expertise')
    const switcher = await languageSwitcher(page)
    await switcher.getByText('FR').click()
    await expect(page).toHaveURL(/\/fr\/expertise$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })

  test('follows the translated slug of an article', async ({ page }) => {
    await page.goto('/en/insights')
    await page.locator('main a[href^="/en/insights/"]').first().click()
    await expect(page).toHaveURL(/\/en\/insights\/.+/)

    const switcher = await languageSwitcher(page)
    // The switcher reads the hreflang alternates once hydrated; a click fired
    // before that lands on the untranslated fallback path. Retried as a block.
    await expect(async () => {
      await switcher.getByText('DE').click()
      await expect(page).toHaveURL(/\/de\/insights\/.+/, { timeout: 3000 })
    }).toPass({ timeout: 20_000 })
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    // The German slug differs from the English one.
    expect(page.url()).not.toContain('reading-a-balance-sheet')
  })

  test('keeps the selected language while navigating', async ({ page }) => {
    await page.goto('/de')
    await page
      .locator('header')
      .getByRole('link', { name: /Zusammenarbeiten|Kontakt/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/de\/contact$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  })

  test('exposes canonical and hreflang alternates', async ({ page }) => {
    await page.goto('/fr/about')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/fr\/about$/)
    for (const locale of ['en', 'fr', 'de']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`)).toHaveCount(1)
    }
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
  })

  test('no language mixing on a page', async ({ page }) => {
    await page.goto('/de')
    const body = (await page.locator('main').innerText()).toLowerCase()
    // Navigation labels of the other languages must not appear.
    expect(body).not.toContain('travailler avec moi')
    expect(body).not.toContain('explore my expertise')
  })
})

test.describe('theme', () => {
  test('switches to dark and persists across navigation and reloads', async ({ page }) => {
    await page.goto('/en')

    const toggle = await themeToggle(page)
    await toggle.locator('[data-theme-option="dark"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.goto('/en/about')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    const toggleAgain = await themeToggle(page)
    await toggleAgain.locator('[data-theme-option="light"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('follows the system preference by default', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' })
    const page = await context.newPage()
    await page.goto('/en')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await context.close()
  })

  test('the theme control is reachable and operable with the keyboard', async ({ page }) => {
    await page.goto('/en')
    const toggle = await themeToggle(page)
    const darkOption = toggle.locator('[data-theme-option="dark"]')
    await darkOption.focus()
    await expect(darkOption).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})
