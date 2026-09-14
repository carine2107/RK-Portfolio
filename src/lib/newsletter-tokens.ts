import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Signed newsletter links (confirmation, unsubscription).
 *
 * A token is `<subscriberId>.<expiresAt in seconds>.<signature>` signed with
 * HMAC-SHA256: nothing needs to be stored, a link cannot be forged or reused
 * for another subscriber or purpose, and a confirmation link expires. Free of
 * `server-only` so the unit tests and scripts can import it.
 */

export type TokenPurpose = 'confirm' | 'unsubscribe'

/** Unsubscription links never expire (they sit in every e-mail ever sent). */
const NEVER = 0

function signature(secret: string, purpose: TokenPurpose, id: string, expires: number): string {
  return createHmac('sha256', secret).update(`${purpose}:${id}:${expires}`).digest('base64url')
}

export function signToken(
  secret: string,
  purpose: TokenPurpose,
  id: string | number,
  expiresAt: Date | null,
): string {
  const expires = expiresAt ? Math.floor(expiresAt.getTime() / 1000) : NEVER
  return `${id}.${expires}.${signature(secret, purpose, String(id), expires)}`
}

/** Subscriber id carried by a valid token, or null (tampered, expired, other purpose). */
export function verifyToken(
  secret: string,
  purpose: TokenPurpose,
  token: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!token || token.length > 300) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [id, expiresRaw, given] = parts as [string, string, string]
  if (!/^[\w-]{1,64}$/.test(id) || !/^\d{1,12}$/.test(expiresRaw)) return null

  const expires = Number(expiresRaw)
  const expected = signature(secret, purpose, id, expires)
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  if (expires !== NEVER && expires * 1000 < now.getTime()) return null
  return id
}
