/**
 * Runs once when a Next.js server instance starts.
 *
 * Starts the daily deletion of expired contact requests (see
 * src/lib/retention.ts). Loaded lazily and only on the Node.js runtime, never
 * during `next build`.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const { scheduleContactRetention } = await import('./lib/retention-schedule')
  scheduleContactRetention()
}
