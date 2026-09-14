import { expect, test } from '@playwright/test'

const LOCALES = ['en', 'fr', 'de'] as const

test.describe('navigation', () => {
  test('the root redirects to a locale', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(en|fr|de)$/)
  })

  for (const locale of LOCALES) {
    test(`main sections are reachable in ${locale}`, async ({ page }) => {
      const sections = [
        '/about',
        '/expertise',
        '/experience',
        '/insights',
        '/books',
        '/businesses',
        '/contact',
      ]

      for (const section of sections) {
        const response = await page.goto(`/${locale}${section}`)
        expect(response?.status(), `${locale}${section}`).toBeLessThan(400)
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
      }
    })
  }

  test('every page exposes exactly one h1', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('h1')).toHaveCount(1)
    await page.goto('/en/insights')
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('the skip link moves focus to the main content', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Safari does not tab to links by default')
    await page.goto('/en')
    await page.keyboard.press('Tab')
    const skip = page.locator('a[href="#main-content"]')
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('an unknown path renders the localised 404', async ({ page }) => {
    const response = await page.goto('/en/this-page-does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('does not exist')
  })

  test('the French 404 is localised', async ({ page }) => {
    await page.goto('/fr/cette-page-nexiste-pas')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('n’existe pas')
  })
})

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('opens, shows the navigation and closes with Escape', async ({ page }) => {
    await page.goto('/en')

    const toggle = page.getByRole('button', { name: /open the main menu/i })
    await expect(toggle).toBeVisible()
    await toggle.click()

    const menu = page.locator('#rk-mobile-menu')
    await expect(menu).toBeVisible()
    await expect(page.getByRole('button', { name: /close the main menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(menu.getByRole('link', { name: 'Expertise' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })

  test('navigating from the menu closes it', async ({ page }) => {
    await page.goto('/en')
    await page.getByRole('button', { name: /open the main menu/i }).click()
    await page.locator('#rk-mobile-menu').getByRole('link', { name: 'Books' }).click()
    await expect(page).toHaveURL(/\/en\/books$/)
    await expect(page.locator('#rk-mobile-menu')).toBeHidden()
  })
})

test.describe('responsive layout', () => {
  const widths = [320, 375, 768, 1024, 1280, 1440, 1536]

  for (const width of widths) {
    test(`no horizontal scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })

      for (const path of [
        '/en',
        '/en/expertise',
        '/fr/speaking',
        '/fr/experience',
        '/de/contact',
      ]) {
        await page.goto(path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1)
      }
    })
  }
})
