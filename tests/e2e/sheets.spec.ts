import { expect, test } from '@playwright/test'

test.describe('Google Sheets admin endpoint', () => {
  test('an anonymous visitor can neither read the status nor start a sync', async ({ request }) => {
    const status = await request.get('/api/admin/sheets')
    expect(status.status()).toBe(401)
    expect(await status.json()).toEqual({ ok: false })

    const sync = await request.post('/api/admin/sheets')
    expect(sync.status()).toBe(401)
  })

  test('a sync request coming from another site is refused', async ({ request }) => {
    const response = await request.post('/api/admin/sheets', {
      headers: { Origin: 'https://evil.example' },
    })
    expect(response.status()).toBe(403)
  })
})
