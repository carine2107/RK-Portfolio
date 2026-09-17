import { expect, test } from '@playwright/test'

import { adminHeaders } from './admin-session'

const MAILHOG = process.env.E2E_MAILHOG_URL ?? 'http://localhost:8026'

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

    const headers = adminHeaders()

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

      // Example templates added by `npm run seed:reply-templates` (CI step), in German.
      const templates = await request.get('/api/cms/reply-templates?locale=de&limit=50&depth=0', {
        headers,
      })
      const { docs } = (await templates.json()) as { docs: { body: string }[] }
      expect(docs.length).toBeGreaterThanOrEqual(5)
      expect(docs.map((doc) => doc.body).join(' ')).toContain('Guten Tag {name}')

      // Templates are private: not readable without an account (fresh context, no cookie).
      const anonymous = await playwright.request.newContext({ baseURL })
      expect((await anonymous.get('/api/cms/reply-templates')).status()).toBe(403)
      await anonymous.dispose()
    } finally {
      expect((await request.delete(url, { headers })).ok()).toBe(true)
    }
  })
  test('routes a request to the company it concerns', async ({ page, request }, testInfo) => {
    // Changes a shared company record: one project only, never in parallel with itself.
    test.skip(testInfo.project.name !== 'chromium', 'Checked once')
    test.setTimeout(90_000)
    const mailhog = await request.get(`${MAILHOG}/api/v2/messages?limit=1`).catch(() => null)
    test.skip(!mailhog?.ok(), 'MailHog is not running: e-mail delivery cannot be observed')

    // The business card link preselects the company in the form.
    await page.goto('/en/contact?business=rk-business-consulting')
    await expect(page.locator('#contact-business')).toHaveValue('rk-business-consulting')

    const headers = adminHeaders()
    const found = await request.get(
      '/api/cms/businesses?where[slug][equals]=rk-business-consulting&locale=en&depth=0',
      { headers },
    )
    const [business] = (await found.json()).docs as { id: number; contactEmail?: string | null }[]
    expect(business).toBeTruthy()
    const companyEmail = `company-${Date.now()}@example.com`
    const businessUrl = `/api/cms/businesses/${business!.id}`
    expect(
      (await request.patch(businessUrl, { headers, data: { contactEmail: companyEmail } })).ok(),
    ).toBe(true)

    const subject = `Routing check ${Date.now()}`
    try {
      const submitted = await request.post('/api/contact', {
        data: {
          name: 'Routing Test',
          email: 'qa-routing@example.com',
          country: 'DE',
          requestType: 'consulting',
          business: 'rk-business-consulting',
          subject,
          message:
            'This message was created by the automated end-to-end test suite of the website.',
          consent: true,
          locale: 'en',
        },
      })
      expect(submitted.status()).toBe(200)

      const stored = await request.get(
        `/api/cms/contact-submissions?where[subject][equals]=${encodeURIComponent(subject)}&depth=0`,
        { headers },
      )
      const [doc] = (await stored.json()).docs as { id: number; business?: number }[]
      expect(doc?.business).toBe(business!.id)

      const search = await request.get(
        `${MAILHOG}/api/v2/search?kind=to&query=${encodeURIComponent(companyEmail)}`,
      )
      const { items } = (await search.json()) as {
        items: { Content: { Headers: Record<string, string[]> } }[]
      }
      expect(items).toHaveLength(1)
      const mailHeaders = items[0]!.Content.Headers
      expect(mailHeaders.To?.join(',')).toContain(companyEmail)
      expect(mailHeaders.Cc?.join(',') ?? '').not.toBe('')

      if (doc) await request.delete(`/api/cms/contact-submissions/${doc.id}`, { headers })
    } finally {
      await request.patch(businessUrl, {
        headers,
        data: { contactEmail: business!.contactEmail ?? null },
      })
    }
  })
})
