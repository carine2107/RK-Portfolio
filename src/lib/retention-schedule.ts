import config from '@payload-config'
import { getPayload } from 'payload'

import { cmsEnabled, contactRetentionMonths } from '@/lib/env'
import { purgeExpiredContactSubmissions } from '@/lib/retention'

const FIRST_RUN_DELAY_MS = 60_000
const DAY_MS = 24 * 60 * 60 * 1000

type RetentionGlobal = typeof globalThis & { __rkContactRetention?: boolean }

/**
 * Purges expired contact requests one minute after start-up, then every day.
 * The timers never keep the process alive, and a failure (database briefly
 * unavailable) only postpones the purge to the next run.
 */
export function scheduleContactRetention(): void {
  const scope = globalThis as RetentionGlobal
  if (scope.__rkContactRetention) return
  if (!cmsEnabled || contactRetentionMonths <= 0) return
  scope.__rkContactRetention = true

  const run = async () => {
    try {
      const payload = await getPayload({ config })
      const deleted = await purgeExpiredContactSubmissions(payload, contactRetentionMonths)
      if (deleted > 0) {
        console.info(
          `[retention] ${deleted} contact request(s) unchanged for ${contactRetentionMonths} months deleted.`,
        )
      }
    } catch (error) {
      console.warn(
        '[retention] Purge postponed:',
        error instanceof Error ? error.message : 'unknown error',
      )
    }
  }

  setTimeout(run, FIRST_RUN_DELAY_MS).unref()
  setInterval(run, DAY_MS).unref()
}
