import { expect, test, type APIRequestContext } from '@playwright/test'

/** MailHog web API of the local development stack (docker-compose.yml). */
const MAILHOG = process.env.E2E_MAILHOG_URL ?? 'http://localhost:8026'

type MailhogMessage = {
  Content: { Headers: Record<string, string[]>; Body: string }
  MIME?: { Parts?: { Headers: Record<string, string[]>; Body: string }[] }
}

const decodeQuotedPrintable = (value: string) =>
  value
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))

async function waitForMail(request: APIRequestContext, to: string): Promise<string | null> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await request.get(
      `${MAILHOG}/api/v2/search?kind=to&query=${encodeURIComponent(to)}`,
    )
    if (response.ok()) {
      const { items } = (await response.json()) as { items: MailhogMessage[] }
      const message = items[0]
      if (message) {
        const parts = message.MIME?.Parts ?? []
        const text =
          parts.find((part) => part.Headers['Content-Type']?.[0]?.startsWith('text/plain'))?.Body ??
          message.Content.Body
        return decodeQuotedPrintable(text)
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return null
}

test.describe('newsletter', () => {
  for (const [locale, heading] of [
    ['fr', 'Newsletter RK Insights'],
    ['de', 'RK Insights Newsletter'],
    ['en', 'RK Insights newsletter'],
  ] as const) {
    test(`the sign-up page is published in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/newsletter`)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    })
  }

  test('sign-up requires a valid address and consent', async ({ request }) => {
    const response = await request.post('/api/newsletter/subscribe', {
      data: { email: 'nope', consent: false, locale: 'en' },
    })
    expect(response.status()).toBe(422)
    const body = await response.json()
    expect(Object.keys(body.errors).sort()).toEqual(['consent', 'email'])
  })

  test('the honeypot answers like a success', async ({ request }) => {
    const response = await request.post('/api/newsletter/subscribe', {
      data: { email: 'bot@example.com', consent: true, company: 'bot', locale: 'en' },
    })
    expect(await response.json()).toEqual({ ok: true })
  })

  test('forged confirmation and unsubscription links are refused', async ({ page, request }) => {
    const confirm = await request.post('/api/newsletter/confirm', {
      data: { token: '1.9999999999.forged' },
    })
    expect(confirm.status()).toBe(400)
    const unsubscribe = await request.post('/api/newsletter/unsubscribe?token=1.0.forged', {
      form: { 'List-Unsubscribe': 'One-Click' },
    })
    expect(unsubscribe.status()).toBe(400)

    await page.goto('/en/newsletter/confirm?token=1.9999999999.forged')
    await expect(page.getByRole('heading', { name: 'Invalid or expired link' })).toBeVisible()
  })

  test('double opt-in: the confirmation e-mail link confirms the subscription', async ({
    page,
    request,
  }) => {
    const mailhog = await request.get(`${MAILHOG}/api/v2/messages?limit=1`).catch(() => null)
    test.skip(!mailhog?.ok(), 'MailHog is not running: e-mail delivery cannot be observed')

    await page.goto('/fr/newsletter')
    const form = page.locator('main form')
    test.skip((await form.count()) === 0, 'E-mail delivery is not configured')

    const email = `e2e-newsletter-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`
    await form.getByLabel('Adresse e-mail pour la newsletter').fill(email)
    await form.getByRole('checkbox').check()
    await form.getByRole('button', { name: 'S’inscrire' }).click()
    await expect(page.getByRole('status')).toContainText('Vérifiez votre boîte e-mail')

    const mail = await waitForMail(request, email)
    expect(mail, 'confirmation e-mail').not.toBeNull()
    const link = mail?.match(/https?:\/\/\S+\/fr\/newsletter\/confirm\?token=\S+/)?.[0]
    expect(link, 'confirmation link').toBeTruthy()

    await page.goto(new URL(link as string).pathname + new URL(link as string).search)
    await expect(page.getByRole('heading', { name: 'Inscription confirmée' })).toBeVisible()
  })
})
