/**
 * Retention of contact requests (GDPR data minimisation).
 *
 * A request is deleted once it has not changed for `months` months: the last
 * change is the last exchange (status set to "answered", note, archive…).
 * Shared by the daily job started with the server (src/instrumentation.ts) and
 * the manual command `npm run purge:contacts`.
 *
 * Free of `server-only` and of the Next.js data layer so that the command-line
 * script can import it.
 */
import type { Payload } from 'payload'

/** Date before which requests are expired, or null when retention is disabled (0). */
export function retentionCutoff(months: number, now: Date = new Date()): Date | null {
  if (!Number.isFinite(months) || months <= 0) return null
  const cutoff = new Date(now)
  // UTC: the cutoff must not move with the server time zone or daylight saving.
  cutoff.setUTCMonth(cutoff.getUTCMonth() - Math.floor(months))
  return cutoff
}

/** Deletes audit log entries older than the retention period; returns how many. */
export async function purgeAuditLog(
  payload: Payload,
  months: number,
  now: Date = new Date(),
): Promise<number> {
  const cutoff = retentionCutoff(months, now)
  if (!cutoff) return 0
  const result = await payload.delete({
    collection: 'audit-logs',
    where: { createdAt: { less_than: cutoff.toISOString() } },
    overrideAccess: true,
  })
  return result.docs.length
}

/** Deletes the expired contact requests and returns how many were removed. */
export async function purgeExpiredContactSubmissions(
  payload: Payload,
  months: number,
  now: Date = new Date(),
): Promise<number> {
  const cutoff = retentionCutoff(months, now)
  if (!cutoff) return 0

  const result = await payload.delete({
    collection: 'contact-submissions',
    where: { updatedAt: { less_than: cutoff.toISOString() } },
    overrideAccess: true,
  })
  return result.docs.length
}
