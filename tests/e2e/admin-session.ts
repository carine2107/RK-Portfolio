import fs from 'node:fs'
import path from 'node:path'

import type { Page } from '@playwright/test'

/**
 * One admin sign-in shared by every test that writes to the CMS
 * (admin.setup.ts). Parallel sign-ins to the same account replaced each
 * other's session and made tests fail at random.
 */
export const ADMIN_SESSION_FILE = path.join('.playwright', 'admin-session.json')

export function adminToken(): string {
  const { token } = JSON.parse(fs.readFileSync(ADMIN_SESSION_FILE, 'utf8')) as { token: string }
  return token
}

export function adminHeaders(): { Authorization: string } {
  return { Authorization: `JWT ${adminToken()}` }
}

/** Opens the admin as the shared session (cookie set on the site's address). */
export async function useAdminSession(page: Page, baseURL: string | undefined): Promise<void> {
  await page
    .context()
    .addCookies([
      { name: 'payload-token', value: adminToken(), url: baseURL ?? 'http://localhost:4313' },
    ])
}
