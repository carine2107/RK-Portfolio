import fs from 'node:fs'
import path from 'node:path'

import { expect, test as setup } from '@playwright/test'

import { ADMIN_SESSION_FILE } from './admin-session'

/** Signs in once as the seeded admin, for the tests that need the CMS API or admin. */
setup('admin session', async ({ request }) => {
  setup.skip(
    !process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD,
    'No admin account for this run',
  )
  const login = await request.post('/api/cms/users/login', {
    data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
  })
  expect(login.ok(), await login.text()).toBe(true)
  const { token } = (await login.json()) as { token: string }
  fs.mkdirSync(path.dirname(ADMIN_SESSION_FILE), { recursive: true })
  fs.writeFileSync(ADMIN_SESSION_FILE, JSON.stringify({ token }))
})
