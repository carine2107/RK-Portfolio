import config from '@payload-config'
import { getPayload } from 'payload'

import { auditLogRetentionMonths, cmsEnabled, contactRetentionMonths } from '@/lib/env'
import { sendFollowUpReminders } from '@/lib/follow-up-reminders'
import { processPendingNewsletters, purgeNewsletterSubscribers } from '@/lib/newsletter'
import { purgeAuditLog, purgeExpiredContactSubmissions } from '@/lib/retention'

const FIRST_RUN_DELAY_MS = 60_000
const DAY_MS = 24 * 60 * 60 * 1000
const NEWSLETTER_CHECK_MS = 10 * 60 * 1000
const FOLLOW_UP_CHECK_MS = 60 * 60 * 1000

type ScheduleGlobal = typeof globalThis & { __rkBackgroundJobs?: boolean }

const quietly = (label: string, run: () => Promise<void>) => async () => {
  try {
    await run()
  } catch (error) {
    console.warn(`[${label}] Postponed:`, error instanceof Error ? error.message : 'unknown error')
  }
}

/**
 * Background jobs started with the server (src/instrumentation.ts):
 * - daily: deletion of expired contact requests and newsletter sign-ups;
 * - every 10 minutes: newsletter delivery of articles whose scheduled
 *   publication date has arrived;
 * - every hour: reminder e-mail for contact requests whose follow-up date has come.
 * Timers never keep the process alive; a failure only postpones the run.
 */
export function scheduleContactRetention(): void {
  const scope = globalThis as ScheduleGlobal
  if (scope.__rkBackgroundJobs || !cmsEnabled) return
  scope.__rkBackgroundJobs = true

  const daily = quietly('retention', async () => {
    const payload = await getPayload({ config })
    if (contactRetentionMonths > 0) {
      const deleted = await purgeExpiredContactSubmissions(payload, contactRetentionMonths)
      if (deleted > 0) {
        console.info(
          `[retention] ${deleted} contact request(s) unchanged for ${contactRetentionMonths} months deleted.`,
        )
      }
    }
    const auditEntries = await purgeAuditLog(payload, auditLogRetentionMonths)
    if (auditEntries > 0) {
      console.info(
        `[retention] ${auditEntries} audit log entr(y/ies) older than ${auditLogRetentionMonths} months deleted.`,
      )
    }
    const subscribers = await purgeNewsletterSubscribers(payload)
    if (subscribers > 0) {
      console.info(`[retention] ${subscribers} expired newsletter sign-up(s) deleted.`)
    }
  })

  const newsletter = quietly('newsletter', async () => {
    await processPendingNewsletters(await getPayload({ config }))
  })

  const followUps = quietly('follow-up', async () => {
    const reminded = await sendFollowUpReminders(await getPayload({ config }))
    if (reminded > 0) console.info(`[follow-up] Reminder sent for ${reminded} contact request(s).`)
  })

  setTimeout(daily, FIRST_RUN_DELAY_MS).unref()
  setInterval(daily, DAY_MS).unref()
  setTimeout(newsletter, FIRST_RUN_DELAY_MS + 15_000).unref()
  setInterval(newsletter, NEWSLETTER_CHECK_MS).unref()
  setTimeout(followUps, FIRST_RUN_DELAY_MS + 30_000).unref()
  setInterval(followUps, FOLLOW_UP_CHECK_MS).unref()
}
