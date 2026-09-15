import { expect, test } from '@playwright/test'

/**
 * Direct order of a book without online payment: when "Offer direct ordering
 * through the form" is ticked in the CMS, an "Order here" button under the
 * retailer links opens the contact form with the "Book order" type and the book
 * title as subject. No cart, no checkout.
 */
test.describe('book direct order through the contact form', () => {
  test('the book page offers "Commander ici" and prefills the contact form', async ({ page }) => {
    await page.goto('/fr/books')
    await page.locator('main a[href^="/fr/books/"]').first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const order = page.getByRole('link', { name: 'Commander ici' })
    await expect(order).toBeVisible()
    await expect(order).toHaveAttribute('href', /^\/fr\/contact\?type=bookOrder&subject=Commande/)
    await expect(page.getByRole('button', { name: /ajouter au panier/i })).toHaveCount(0)

    await order.click()
    await expect(page).toHaveURL(/\/fr\/contact\?type=bookOrder&subject=/)
    await expect(page.locator('select[name="requestType"]')).toHaveValue('bookOrder')
    await expect(page.locator('input[name="subject"]')).toHaveValue(/^Commande : .+/)
  })
})
