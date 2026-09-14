import { expect, test } from '@playwright/test'

test.describe('admin CSV exports', () => {
  for (const collection of ['subscribers', 'contact-submissions', 'users']) {
    test(`an anonymous visitor cannot export ${collection}`, async ({ request }) => {
      const response = await request.get(`/api/admin/export/${collection}?lang=en`)
      expect(response.status()).toBe(401)
      expect(await response.text()).toBe('')
    })
  }
})
