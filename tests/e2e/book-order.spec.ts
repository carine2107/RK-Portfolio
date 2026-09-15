import { expect, test } from '@playwright/test'

/**
 * Direct purchase of a retailer book: "Commander ici" opens an add-to-cart dialog,
 * then the cart asks for the customer's details before the payment options.
 *
 * The delivered database has no price and the shop is closed, so the checkout
 * steps are exercised with a mocked quote; the payment request itself is
 * intercepted and never reaches a provider.
 */
test.describe('book direct purchase', () => {
  test('"Commander ici" opens the order dialog', async ({ page }) => {
    await page.goto('/fr/books')
    await page.locator('main a[href^="/fr/books/"]').first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Commander ici' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Commander ici' }).click()
    const dialog = page.getByRole('dialog', { name: 'Commander ce livre' })
    await expect(dialog).toBeVisible()

    const add = dialog.getByRole('button', { name: 'Ajouter au panier' })
    if (await add.isVisible()) {
      await add.click()
      await expect(dialog.getByText('Le livre a été ajouté à votre panier.')).toBeVisible()
      await expect(dialog.getByRole('link', { name: 'Aller au panier' })).toBeVisible()
      await dialog.getByRole('button', { name: 'Continuer mes achats' }).click()
    } else {
      // No price yet: the dialog says so instead of offering a cart.
      await expect(dialog.getByText(/pas encore ouverte/)).toBeVisible()
      await page.keyboard.press('Escape')
    }
    await expect(dialog).toBeHidden()
  })

  test('the cart asks for the details, then shows the payment options', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('rk-cart', JSON.stringify([{ bookId: '1', quantity: 2 }]))
    })
    await page.route('**/api/shop/quote', (route) =>
      route.fulfill({
        json: {
          ok: true,
          active: true,
          providers: { stripe: true, paypal: true },
          items: [
            {
              bookId: '1',
              kind: 'book',
              title: 'Livre de test',
              quantity: 2,
              unitPrice: 24.9,
              lineTotal: 49.8,
            },
          ],
          total: 49.8,
          vatRate: 0,
          vatAmount: 0,
          currency: 'EUR',
          removed: [],
          requiresShipping: true,
          hasDigital: false,
        },
      }),
    )
    let checkoutBody: Record<string, unknown> | null = null
    await page.route('**/api/shop/checkout', (route) => {
      checkoutBody = route.request().postDataJSON() as Record<string, unknown>
      return route.fulfill({ status: 503, json: { ok: false, reason: 'unavailable' } })
    })

    await page.goto('/fr/cart')
    await expect(page.getByText('Livre de test')).toBeVisible()
    await page.getByRole('button', { name: 'Payer maintenant' }).click()

    await expect(page.getByRole('heading', { name: 'Vos coordonnées' })).toBeFocused()
    await page.getByRole('button', { name: 'Payer maintenant' }).click()
    await expect(page.getByText('6 champs à corriger')).toBeVisible()

    // Scoped to the details form: the footer newsletter also has an e-mail field.
    const form = page
      .locator('form')
      .filter({ has: page.getByRole('heading', { name: 'Vos coordonnées' }) })
    await form.getByLabel('Nom complet').fill('Awa Nguema')
    await form.getByLabel('E-mail').fill('awa@example.org')
    await form.getByLabel('Rue et numéro').fill('Hauptstraße 12')
    await form.getByLabel('Code postal').fill('10115')
    await form.getByLabel('Ville').fill('Berlin')
    await form.getByLabel('Pays').selectOption('DE')
    await page.getByRole('button', { name: 'Payer maintenant' }).click()
    await expect(
      page.getByText('Veuillez accepter les conditions générales de vente.'),
    ).toBeVisible()

    await form.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Payer maintenant' }).click()

    await expect(page.getByRole('heading', { name: 'Moyen de paiement' })).toBeVisible()
    // The footer has its own <address>: keep the delivery one.
    const delivery = page.locator('address').filter({ hasText: 'Hauptstraße 12' })
    await expect(delivery).toContainText('10115 Berlin')
    await expect(delivery).toContainText('Allemagne')
    await page.getByRole('button', { name: 'Payer par carte' }).click()
    await expect(
      page.getByText('La vente directe n’est pas disponible pour le moment.'),
    ).toBeVisible()
    expect(checkoutBody).toMatchObject({
      provider: 'stripe',
      acceptTerms: true,
      customer: { name: 'Awa Nguema', city: 'Berlin', country: 'DE' },
    })
    await expect(page.getByRole('button', { name: 'Payer avec PayPal' })).toBeVisible()

    // Details are kept when going back.
    await page.getByRole('button', { name: 'Modifier mes coordonnées' }).click()
    await expect(form.getByLabel('Ville')).toHaveValue('Berlin')
  })
})
