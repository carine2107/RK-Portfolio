import { expect, test } from '@playwright/test'

import { languageSwitcher, themeToggle } from './helpers'

test.describe('language switching', () => {
  test('switches from English to French and stays on the equivalent page', async ({ page }) => {
    await page.goto('/en/expertise')
    const switcher = await languageSwitcher(page)
    await switcher.getByRole('button', { name: /EN/ }).click()
    await switcher.getByRole('link', { name: 'Français' }).click()
    await expect(page).toHaveURL(/\/fr\/expertise$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })

  test('the language menu opens, lists the three languages and closes with Escape', async ({
    page,
  }) => {
    await page.goto('/fr')
    const switcher = await languageSwitcher(page)
    const button = switcher.getByRole('button', { name: /FR/ })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(switcher.getByRole('link')).toHaveCount(0)

    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(switcher.getByRole('link')).toHaveText(['Français', 'Deutsch', 'English'])
    await expect(switcher.getByRole('link', { name: 'Français' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toBeFocused()
    await expect(switcher.getByRole('link')).toHaveCount(0)
  })

  test('follows the translated slug of an article', async ({ page }) => {
    await page.goto('/en/insights')
    const article = await page.locator('main a[href^="/en/insights/"]').first().getAttribute('href')
    const englishSlug = article?.split('/').pop() ?? ''
    await page.goto(article ?? '/en/insights')

    // The switcher reads the hreflang alternates once hydrated; a click fired
    // before that lands on the untranslated fallback path (/de/insights/<English
    // slug>). Wait until the link carries the German slug.
    const switcher = await languageSwitcher(page)
    const germanLink = switcher.locator('a[hreflang="de"]')
    await expect(germanLink).toHaveAttribute('href', /^\/de\/insights\/.+/)
    await expect(germanLink).not.toHaveAttribute('href', new RegExp(`/${englishSlug}$`))
    const germanPath = await germanLink.getAttribute('href')
    await switcher.getByRole('button', { name: /EN/ }).click()
    await germanLink.click()

    await expect(page).toHaveURL(new RegExp(`${germanPath}$`))
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
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
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await page.goto('/en/about')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    const toggleAgain = await themeToggle(page)
    await expect(toggleAgain).toHaveAttribute('aria-pressed', 'true')
    await toggleAgain.click()
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

  test('the theme button is reachable and operable with the keyboard', async ({ page }) => {
    await page.goto('/en')
    const toggle = await themeToggle(page)
    await expect(toggle).toHaveAccessibleName('Dark mode')
    await toggle.focus()
    await expect(toggle).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('from a dark system preference, one click switches to light', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' })
    const page = await context.newPage()
    await page.goto('/en')
    const toggle = await themeToggle(page)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await context.close()
  })
})
