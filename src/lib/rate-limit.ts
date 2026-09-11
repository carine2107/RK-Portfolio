import 'server-only'

/**
 * Minimal in-memory rate limiter.
 *
 * Deliberately simple: the site runs as a single Node process. If it is ever
 * scaled horizontally, replace the map with a shared store (Redis) — the API
 * of this module does not change. See docs/DEPLOYMENT.md.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    pruneOccasionally(now)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  bucket.count += 1
  if (bucket.count > max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

function pruneOccasionally(now: number): void {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * Best-effort client identifier. Only used as a rate-limit key and never
 * stored: the raw address never reaches the database or the logs.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = headers.get('x-real-ip')?.trim()
  return forwarded || real || 'unknown'
}
