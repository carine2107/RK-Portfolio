import { expect, test } from '@playwright/test'

/**
 * Direct sale while no payment provider is configured (the delivered state):
 * nothing can be paid and nothing pretends it can.
 */
test.describe('direct sale — not activated', () => {
  test('the cart page works and is not indexed', async ({ page }) => {
    await page.goto('/en/cart')
    await expect(page.getByRole('heading', { level: 1, name: 'Cart' })).toBeVisible()
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('no payment button is offered and checkout is refused', async ({ page, request }) => {
    const response = await request.post('/api/shop/checkout', {
      data: {
        lines: [{ bookId: '1', quantity: 1 }],
        locale: 'en',
        provider: 'stripe',
        acceptTerms: true,
      },
    })
    expect(response.status()).toBe(503)
    expect((await response.json()).reason).toBe('unavailable')

    await page.goto('/en/books')
    await expect(page.getByRole('button', { name: /add to cart/i })).toHaveCount(0)
  })

  test('the Stripe webhook refuses unsigned calls', async ({ request }) => {
    const response = await request.post('/api/shop/stripe/webhook', {
      data: {
        type: 'checkout.session.completed',
        data: { object: { metadata: { orderId: '1' } } },
      },
    })
    expect([400, 503]).toContain(response.status())
  })

  test('a forged order reference reveals nothing', async ({ request }) => {
    const response = await request.get('/api/shop/order?ref=1.9999999999.forged')
    expect(response.status()).toBe(404)
    expect(await response.json()).toEqual({ ok: false })
  })
})
