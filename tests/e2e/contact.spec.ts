import { expect, test } from '@playwright/test'

test.describe('contact form', () => {
  test('client validation lists the fields to correct, in the page language', async ({ page }) => {
    await page.goto('/fr/contact')
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page.locator('#contact-name-error')).toHaveText(
      'Veuillez saisir votre nom (au moins 2 caractères).',
    )
    await expect(page.locator('#contact-message-error')).toHaveText(
      'Veuillez écrire un message d’au moins 20 caractères.',
    )
  })

  test('an invalid e-mail is rejected in German', async ({ page }) => {
    await page.goto('/de/contact')
    await page.locator('main form').getByLabel('E-Mail-Adresse').fill('not-an-email')
    await page.getByRole('button', { name: 'Anfrage senden' }).click()
    await expect(page.locator('#contact-email-error')).toHaveText(
      'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    )
  })

  test('a complete submission is accepted and confirmed', async ({ page }) => {
    await page.goto('/en/contact')

    await page.locator('main form').getByLabel('Full name').fill('Test Visitor')
    await page.locator('main form').getByLabel('Organisation').fill('Playwright QA')
    await page.locator('main form').getByLabel('E-mail address').fill('qa@example.com')
    await page.locator('main form').getByLabel('Country').selectOption('DE')
    await page.locator('main form').getByLabel('Type of request').selectOption('consulting')
    await page.locator('main form').getByLabel('Subject').fill('Automated end-to-end test')
    await page
      .getByLabel('Message')
      .fill('This message was created by the automated end-to-end test suite of the website.')
    await page
      .locator('main form')
      .getByLabel(/privacy policy/)
      .check()

    await page.getByRole('button', { name: 'Send my request' }).click()

    await expect(page.getByRole('status')).toContainText(/Thank you/i, { timeout: 20_000 })
  })

  test('the honeypot silently discards a bot submission', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Spam Bot',
        email: 'bot@example.com',
        country: 'DE',
        requestType: 'other',
        subject: 'Buy now',
        message: 'A message long enough to pass the length validation rule.',
        consent: true,
        company: 'filled-by-a-bot',
        locale: 'en',
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ ok: true, emailSent: false })
  })

  test('the API rejects an invalid payload with field errors', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: 'A', email: 'nope', consent: false },
    })
    expect(response.status()).toBe(422)
    const body = await response.json()
    expect(body.ok).toBe(false)
    expect(Object.keys(body.errors)).toContain('email')
  })
})
