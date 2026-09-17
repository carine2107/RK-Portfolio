import { expect, test } from '@playwright/test'

/**
 * Follow-up of a contact request in the CMS (production build, throwaway CI
 * database): the test creates its own request through the public form API,
 * updates it as the admin, checks the history and notes, then deletes it.
 */
test.describe('contact request follow-up', () => {
  test.skip(
    process.env.E2E_PROD !== '1' ||
      process.env.E2E_CMS_WRITE !== '1' ||
      !process.env.SEED_ADMIN_EMAIL ||
      !process.env.SEED_ADMIN_PASSWORD,
    'Needs the production build and the throwaway CMS database',
  )

  test('records notes, status changes and follow-up dates', async ({
    request,
    playwright,
    baseURL,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'API check, browser-independent')
    test.setTimeout(90_000)

    const subject = `Follow-up check ${Date.now()}`
    const submitted = await request.post('/api/contact', {
      data: {
        name: 'Follow Up Test',
        email: 'qa-follow-up@example.com',
        country: 'DE',
        requestType: 'consulting',
        subject,
        message: 'This message was created by the automated end-to-end test suite of the website.',
        consent: true,
        locale: 'de',
      },
    })
    expect(submitted.status()).toBe(200)

    const login = await request.post('/api/cms/users/login', {
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
    })
    expect(login.ok()).toBe(true)
    const headers = { Authorization: `JWT ${(await login.json()).token as string}` }

    const found = await request.get(
      `/api/cms/contact-submissions?where[subject][equals]=${encodeURIComponent(subject)}&depth=0`,
      { headers },
    )
    const [created] = (await found.json()).docs as { id: number; status: string }[]
    expect(created?.status).toBe('new')
    const url = `/api/cms/contact-submissions/${created!.id}`

    try {
      const updated = await request.patch(url, {
        headers,
        data: {
          status: 'answered',
          followUpAt: '2030-01-15T00:00:00.000Z',
          notes: [{ text: 'Called back, proposal to send.' }],
          // A forged history entry must be ignored.
          history: [{ action: 'reminderSent', at: '2020-01-01T00:00:00.000Z' }],
        },
      })
      expect(updated.ok()).toBe(true)

      const doc = (await (await request.get(`${url}?depth=0`, { headers })).json()) as {
        answeredAt?: string
        notes: { text: string; at?: string }[]
        history: { action: string; fromStatus?: string; toStatus?: string; date?: string }[]
      }
      expect(doc.answeredAt).toBeTruthy()
      expect(doc.notes).toHaveLength(1)
      expect(doc.notes[0]?.at).toBeTruthy()
      expect(doc.history.map((entry) => entry.action)).toEqual(['statusChanged', 'followUpSet'])
      expect(doc.history[0]).toMatchObject({ fromStatus: 'new', toStatus: 'answered' })

      // Templates are private: not readable without an account (fresh context, no cookie).
      const anonymous = await playwright.request.newContext({ baseURL })
      expect((await anonymous.get('/api/cms/reply-templates')).status()).toBe(403)
      await anonymous.dispose()
    } finally {
      expect((await request.delete(url, { headers })).ok()).toBe(true)
    }
  })
})
