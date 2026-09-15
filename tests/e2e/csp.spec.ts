import { expect, test, type Page } from '@playwright/test'

/**
 * The Content-Security-Policy forbids eval. Nothing on the site may trigger a
 * violation: neither on page load nor when a form is validated.
 */
async function collectViolations(page: Page): Promise<string[]> {
  const violations: string[] = []
  await page.exposeFunction('reportCspViolation', (entry: string) => violations.push(entry))
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      ;(window as unknown as { reportCspViolation: (entry: string) => void }).reportCspViolation(
        `${event.violatedDirective} ${event.blockedURI} ${event.sourceFile}`,
      )
    })
  })
  return violations
}

test.describe('Content-Security-Policy', () => {
  test('no violation on the home page, including the newsletter form', async ({ page }) => {
    const violations = await collectViolations(page)
    await page.goto('/fr')
    await page.waitForLoadState('networkidle')

    // Submitting the footer form empty runs the client-side validation.
    const newsletter = page.locator('footer form')
    if ((await newsletter.count()) > 0) {
      await newsletter.getByRole('button').click()
      await expect(newsletter.getByRole('alert')).toBeVisible()
    }
    expect(violations).toEqual([])
  })

  test('no violation when the contact form is validated', async ({ page }) => {
    const violations = await collectViolations(page)
    await page.goto('/en/contact')
    await page.getByRole('button', { name: 'Send my request' }).click()
    await expect(page.locator('#contact-name-error')).toBeVisible()
    expect(violations).toEqual([])
  })
})
