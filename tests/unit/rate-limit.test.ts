import { describe, expect, it } from 'vitest'

import { checkRateLimit, clientKey } from '@/lib/rate-limit'

describe('rate limit', () => {
  it('allows up to the limit then blocks', () => {
    const key = `test-${Math.random()}`
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true)
    }
    const blocked = checkRateLimit(key, 3, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('starts a new window once the previous one expired', async () => {
    const key = `test-${Math.random()}`
    expect(checkRateLimit(key, 1, 20).allowed).toBe(true)
    expect(checkRateLimit(key, 1, 20).allowed).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(checkRateLimit(key, 1, 20).allowed).toBe(true)
  })

  it('counts each client separately', () => {
    const first = `test-${Math.random()}`
    const second = `test-${Math.random()}`
    expect(checkRateLimit(first, 1, 60_000).allowed).toBe(true)
    expect(checkRateLimit(first, 1, 60_000).allowed).toBe(false)
    expect(checkRateLimit(second, 1, 60_000).allowed).toBe(true)
  })

  it('reads the client address from proxy headers', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe(
      '203.0.113.9',
    )
    expect(clientKey(new Headers({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7')
    expect(clientKey(new Headers())).toBe('unknown')
  })
})
