import { expect, test } from '@playwright/test'

test.describe('digital products and member area', () => {
  test('the digital products page is published in three languages', async ({ page }) => {
    for (const [locale, heading] of [
      ['fr', 'Produits numériques'],
      ['de', 'Digitale Produkte'],
      ['en', 'Digital products'],
    ] as const) {
      await page.goto(`/${locale}/products`)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    }
  })

  test('the member area requires signing in', async ({ page }) => {
    await page.goto('/en/account')
    await expect(page).toHaveURL(/\/en\/account\/login$/)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('asking for a sign-in link never reveals whether an account exists', async ({ request }) => {
    const unknown = await request.post('/api/members/login', {
      data: { email: `nobody-${Date.now()}@example.com`, locale: 'en' },
    })
    expect([200, 503]).toContain(unknown.status())
    if (unknown.status() === 200) expect(await unknown.json()).toEqual({ ok: true })

    const invalid = await request.post('/api/members/login', {
      data: { email: 'nope', locale: 'en' },
    })
    expect(invalid.status()).toBe(422)
  })

  test('forged sign-in links and anonymous downloads are refused', async ({ page, request }) => {
    const verify = await request.post('/api/members/verify', {
      data: { token: '1-0123456789abcdef.9999999999.forged' },
    })
    expect(verify.status()).toBe(400)

    const download = await request.get('/api/members/download?product=1&file=pdf')
    expect(download.status()).toBe(401)

    const progress = await request.post('/api/members/progress', {
      data: { product: '1', lesson: 'x' },
    })
    expect(progress.status()).toBe(401)

    await page.goto('/en/account/verify?token=1-0123456789abcdef.9999999999.forged')
    await expect(page.getByRole('link', { name: 'Get a new link' })).toBeVisible()
  })

  test('protected files are not served by the public CMS API', async ({ request }) => {
    const response = await request.get('/api/cms/protected-files')
    expect([401, 403]).toContain(response.status())
  })
})
