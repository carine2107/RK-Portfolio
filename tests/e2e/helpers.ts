import { expect, type Locator, type Page } from '@playwright/test'

const OPEN_MENU = /open the main menu|ouvrir le menu principal|hauptmenü öffnen/i

/**
 * Below the `md` breakpoint the language switcher and the theme control live in
 * the mobile menu instead of the header bar. These helpers return the visible
 * instance whatever the viewport, so the same test covers desktop and mobile.
 */
async function visibleControl(page: Page, testId: string): Promise<Locator> {
  const inHeader = page.locator(`header [data-testid="${testId}"]`).first()
  if (await inHeader.isVisible()) return inHeader

  await page.getByRole('button', { name: OPEN_MENU }).click()
  const inMenu = page.locator(`#rk-mobile-menu [data-testid="${testId}"]`).first()
  await expect(inMenu).toBeVisible()
  return inMenu
}

export function languageSwitcher(page: Page): Promise<Locator> {
  return visibleControl(page, 'language-switcher')
}

export function themeToggle(page: Page): Promise<Locator> {
  return visibleControl(page, 'theme-toggle')
}
