import { expect, test } from '@playwright/test'

/**
 * Pages are cached for 5 minutes, but a change published in the CMS must show
 * on the site within seconds (src/payload/hooks/revalidate.ts). Writes to the
 * CMS, so it only runs where E2E_CMS_WRITE=1 (the throwaway CI database); it
 * creates its own entry and deletes it afterwards.
 */
test.describe('CMS changes on the public site', () => {
  test.skip(
    process.env.E2E_PROD !== '1' ||
      process.env.E2E_CMS_WRITE !== '1' ||
      !process.env.SEED_ADMIN_EMAIL ||
      !process.env.SEED_ADMIN_PASSWORD,
    'Needs the production build and a throwaway CMS database',
  )

  test('appear and disappear without waiting for the cache', async ({ request, browserName }) => {
    test.skip(browserName !== 'chromium', 'HTTP check, browser-independent')
    test.setTimeout(90_000)

    const login = await request.post('/api/cms/users/login', {
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
    })
    expect(login.ok()).toBe(true)
    const { token } = (await login.json()) as { token: string }
    const headers = { Authorization: `JWT ${token}` }

    const pageText = async () => (await request.get('/fr/about')).text()
    // Warm the cache so the page would stay stale for 5 minutes without the hook.
    await pageText()
    await pageText()

    const title = `Refresh check ${Date.now()}`
    const created = await request.post('/api/cms/credentials?locale=fr', {
      headers,
      data: { title, institution: 'E2E', kind: 'credential', _status: 'published' },
    })
    expect(created.ok()).toBe(true)
    const { doc } = (await created.json()) as { doc: { id: number | string } }

    try {
      // The refreshed page is rendered on the next visit: allow a few requests.
      await expect
        .poll(pageText, { timeout: 20_000, intervals: [500, 1000, 2000] })
        .toContain(title)
    } finally {
      const deleted = await request.delete(`/api/cms/credentials/${doc.id}`, { headers })
      expect(deleted.ok()).toBe(true)
    }
    await expect
      .poll(pageText, { timeout: 20_000, intervals: [500, 1000, 2000] })
      .not.toContain(title)
  })
})
