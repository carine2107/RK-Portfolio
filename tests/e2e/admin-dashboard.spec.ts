import { expect, test } from '@playwright/test'

/**
 * Admin home overview (AdminDashboard.tsx) on the production build. Needs the
 * seeded admin account of the throwaway CI database.
 */
test.describe('admin dashboard', () => {
  test.skip(
    process.env.E2E_PROD !== '1' ||
      process.env.E2E_CMS_WRITE !== '1' ||
      !process.env.SEED_ADMIN_EMAIL ||
      !process.env.SEED_ADMIN_PASSWORD,
    'Needs the production build and the throwaway CMS database',
  )

  test('shows the key figures and links to filtered lists', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Admin screen, checked once')
    test.setTimeout(90_000)

    const login = await page.request.post('/api/cms/users/login', {
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
    })
    expect(login.ok()).toBe(true)

    await page.goto('/admin')
    const dashboard = page.locator('.rk-dash')
    await expect(dashboard).toBeVisible()
    await expect(dashboard.locator('.rk-dash__tile')).toHaveCount(4)
    await expect(dashboard.locator('.rk-dash__bars').first().locator('li')).toHaveCount(6)

    // The high-priority tile opens the contact requests list with its filter.
    await dashboard.locator('.rk-dash__tile').nth(1).click()
    await expect(page).toHaveURL(/\/admin\/collections\/contact-submissions\?where/)
    await expect(page.locator('.collection-list')).toBeVisible()
  })
})
