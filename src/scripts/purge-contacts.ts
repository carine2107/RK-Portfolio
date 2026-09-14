/**
 * Deletes the contact requests unchanged for CONTACT_RETENTION_MONTHS months
 * (default 24). The server already does it every day; this command runs it on
 * demand (or from a system cron when the site runs without Docker).
 *
 *   npm run purge:contacts
 */
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import { purgeExpiredContactSubmissions, retentionCutoff } from '../lib/retention'

async function main(): Promise<void> {
  const months = Number.parseInt(process.env.CONTACT_RETENTION_MONTHS ?? '24', 10)
  const cutoff = retentionCutoff(months)
  if (!cutoff) {
    console.log('Retention disabled (CONTACT_RETENTION_MONTHS=0): nothing deleted.')
    process.exit(0)
  }

  const payload = await getPayload({ config })
  const deleted = await purgeExpiredContactSubmissions(payload, months)
  console.log(
    `${deleted} contact request(s) unchanged since ${cutoff.toISOString().slice(0, 10)} deleted.`,
  )
  process.exit(0)
}

main().catch((error) => {
  console.error('Purge failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
