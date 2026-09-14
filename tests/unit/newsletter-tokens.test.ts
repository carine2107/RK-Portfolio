import { describe, expect, it } from 'vitest'

import { signToken, verifyToken } from '@/lib/newsletter-tokens'

const SECRET = 'a-test-secret-that-is-long-enough-for-hmac'
const now = new Date('2026-09-14T10:00:00.000Z')
const inTwoDays = new Date('2026-09-16T10:00:00.000Z')

describe('newsletter tokens', () => {
  it('round-trips the subscriber id', () => {
    const token = signToken(SECRET, 'confirm', 42, inTwoDays)
    expect(verifyToken(SECRET, 'confirm', token, now)).toBe('42')
  })

  it('expires confirmation links', () => {
    const token = signToken(SECRET, 'confirm', 42, inTwoDays)
    expect(verifyToken(SECRET, 'confirm', token, new Date('2026-09-16T10:00:01.000Z'))).toBeNull()
  })

  it('keeps unsubscription links valid without expiry', () => {
    const token = signToken(SECRET, 'unsubscribe', 'abc-123', null)
    expect(verifyToken(SECRET, 'unsubscribe', token, new Date('2036-01-01'))).toBe('abc-123')
  })

  it('refuses a token used for another purpose, subscriber or secret', () => {
    const token = signToken(SECRET, 'confirm', 42, inTwoDays)
    expect(verifyToken(SECRET, 'unsubscribe', token, now)).toBeNull()
    expect(
      verifyToken('another-secret-of-sufficient-length-here', 'confirm', token, now),
    ).toBeNull()
    const [, expires, sig] = token.split('.')
    expect(verifyToken(SECRET, 'confirm', `43.${expires}.${sig}`, now)).toBeNull()
  })

  it('refuses malformed input', () => {
    for (const value of ['', null, undefined, 'a.b', '1.2.3.4', '../etc.1.x', 'x'.repeat(400)]) {
      expect(verifyToken(SECRET, 'confirm', value, now), String(value)).toBeNull()
    }
  })
})
