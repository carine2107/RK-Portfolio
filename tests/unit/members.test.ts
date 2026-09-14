import { describe, expect, it } from 'vitest'

import { memberIdFromSession, sessionToken } from '@/lib/members'

describe('member session cookie', () => {
  it('round-trips the member id', () => {
    expect(memberIdFromSession(sessionToken(42))).toBe('42')
  })

  it('refuses a forged, tampered or foreign token', () => {
    const token = sessionToken(42)
    const [, expires, signature] = token.split('.')
    expect(memberIdFromSession(`43.${expires}.${signature}`)).toBeNull()
    expect(memberIdFromSession('42.9999999999.forged')).toBeNull()
    expect(memberIdFromSession('')).toBeNull()
    expect(memberIdFromSession(undefined)).toBeNull()
  })
})
