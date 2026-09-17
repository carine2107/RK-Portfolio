import { expect, test } from '@playwright/test'

/**
 * Admin audit log on the production build (throwaway CI database): the test
 * signs in, creates, publishes and deletes its own entry, then reads the log.
 */
test.describe('admin audit log', () => {
  // Both tests sign in to the same account: parallel sign-ins made a request fail once.
  test.describe.configure({ mode: 'serial' })

  test.skip(
    process.env.E2E_PROD !== '1' ||
      process.env.E2E_CMS_WRITE !== '1' ||
      !process.env.SEED_ADMIN_EMAIL ||
      !process.env.SEED_ADMIN_PASSWORD,
    'Needs the production build and the throwaway CMS database',
  )

  test('records who did what, and cannot be changed', async ({
    request,
    playwright,
    baseURL,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'API check, run once')
    test.setTimeout(90_000)

    const login = await request.post('/api/cms/users/login', {
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
    })
    expect(login.ok()).toBe(true)
    const headers = { Authorization: `JWT ${(await login.json()).token as string}` }

    const title = `Audit check ${Date.now()}`
    const created = await request.post('/api/cms/credentials?locale=fr', {
      headers,
      data: { title, institution: 'E2E', kind: 'credential', _status: 'draft' },
    })
    expect(created.ok(), await created.text()).toBe(true)
    const id = String(((await created.json()) as { doc: { id: number } }).doc.id)
    expect(
      (
        await request.patch(`/api/cms/credentials/${id}?locale=fr`, {
          headers,
          data: { institution: 'E2E updated', _status: 'published' },
        })
      ).ok(),
    ).toBe(true)
    expect((await request.delete(`/api/cms/credentials/${id}`, { headers })).ok()).toBe(true)

    type Entry = {
      id: number
      action: string
      entity: string
      userLabel: string
      documentTitle: string
      changedFields: string
    }
    let entries: Entry[] = []
    await expect
      .poll(
        async () => {
          const response = await request.get(
            `/api/cms/audit-logs?where[entity][equals]=credentials&where[documentId][equals]=${id}&sort=createdAt&depth=0`,
            { headers },
          )
          entries = ((await response.json()) as { docs: Entry[] }).docs
          return entries.map((entry) => entry.action)
        },
        { timeout: 15_000 },
      )
      .toEqual(['draft', 'publish', 'delete'])
    expect(entries[0]?.documentTitle).toBe(title)
    expect(entries[0]?.userLabel).toContain(process.env.SEED_ADMIN_EMAIL!)
    expect(entries[1]?.changedFields).toContain('institution')
    expect(entries[1]?.changedFields).not.toContain('E2E updated')

    const logins = await request.get(
      '/api/cms/audit-logs?where[action][equals]=login&where[entity][equals]=users&limit=1&depth=0',
      { headers },
    )
    expect(((await logins.json()) as { totalDocs: number }).totalDocs).toBeGreaterThan(0)

    // Not editable, not deletable, and invisible without an account.
    const entryUrl = `/api/cms/audit-logs/${entries[0]!.id}`
    expect((await request.patch(entryUrl, { headers, data: { action: 'update' } })).status()).toBe(
      403,
    )
    expect((await request.delete(entryUrl, { headers })).status()).toBe(403)
    const anonymous = await playwright.request.newContext({ baseURL })
    expect((await anonymous.get('/api/cms/audit-logs')).status()).toBe(403)
    await anonymous.dispose()
  })
  test('shows period tabs, filters and days on the audit log screen', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Admin screen, checked once')
    test.setTimeout(90_000)

    const login = await page.request.post('/api/cms/users/login', {
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
    })
    expect(login.ok()).toBe(true)

    await page.goto('/admin/globals/site-settings')
    await page.locator('a[href="/admin/collections/audit-logs"]').first().click()
    await page.waitForURL(/\/admin\/collections\/audit-logs(\?|$)/)
    const screen = page.locator('.rk-audit')
    await expect(screen).toBeVisible()
    // Breadcrumb names this screen, even when arriving from another one.
    await expect(page.locator('.step-nav')).toContainText(
      await screen.locator('.rk-audit__title').innerText(),
    )
    await expect(screen.locator('.rk-audit__period')).toHaveCount(5)
    await expect(screen.locator('.rk-audit__period.is-active')).toHaveCount(1)
    // The sign-in above is in today's group, open by default.
    await expect(screen.locator('.rk-audit__day').first()).toHaveAttribute('open', '')
    await expect(screen.locator('.rk-audit__badge--session').first()).toBeVisible()

    // Day tab, then the action filter: the address keeps the choices.
    await screen.locator('.rk-audit__period').first().click()
    await expect(page).toHaveURL(/period=day/)
    await screen.locator('select[name="action"]').selectOption('login')
    await screen.locator('.rk-audit__filters button[type="submit"]').click()
    await expect(page).toHaveURL(/period=day.*action=login/)
    const badges = screen.locator('.rk-audit__badge')
    expect(await badges.count()).toBeGreaterThan(0)
    await expect(screen.locator('.rk-audit__badge--session')).toHaveCount(await badges.count())
  })
})
