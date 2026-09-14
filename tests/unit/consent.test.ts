import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  clearAnalyticsCookies,
  CONSENT_KEY,
  readConsent,
  validMeasurementId,
  writeConsent,
} from '@/lib/consent'

const memoryStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('analytics consent', () => {
  it('has no choice until the visitor decides, then remembers it', () => {
    const storage = memoryStorage()
    expect(readConsent(storage)).toBeNull()
    writeConsent(storage, 'granted', new Date('2026-09-14T10:00:00Z'))
    expect(readConsent(storage)).toBe('granted')
    expect(JSON.parse(storage.getItem(CONSENT_KEY) ?? '')).toEqual({
      v: 1,
      analytics: true,
      at: '2026-09-14T10:00:00.000Z',
    })
    writeConsent(storage, 'denied')
    expect(readConsent(storage)).toBe('denied')
  })

  it('asks again after a version change or a corrupted value, and survives no storage', () => {
    const storage = memoryStorage()
    storage.setItem(CONSENT_KEY, JSON.stringify({ v: 0, analytics: true }))
    expect(readConsent(storage)).toBeNull()
    storage.setItem(CONSENT_KEY, '{not json')
    expect(readConsent(storage)).toBeNull()
    expect(readConsent(null)).toBeNull()
    expect(() => writeConsent(null, 'granted')).not.toThrow()
  })

  it('accepts only Google Analytics 4 identifiers', () => {
    expect(validMeasurementId(' g-ab12cd34ef ')).toBe('G-AB12CD34EF')
    expect(validMeasurementId('UA-12345-1')).toBe('')
    expect(validMeasurementId('G-<script>')).toBe('')
    expect(validMeasurementId(undefined)).toBe('')
  })

  it('removes the Google Analytics cookies on the host and parent domains only', () => {
    const written: string[] = []
    const doc = {
      get cookie() {
        return '_ga=GA1.1.1; theme=dark; _ga_AB12CD=GS1.1; _gid=GA1.2; RK_LOCALE=fr'
      },
      set cookie(value: string) {
        written.push(value)
      },
    }
    clearAnalyticsCookies(doc, 'www.romialkenmogne.com')
    expect(written).toHaveLength(9)
    expect(written).toContain('_ga=; Max-Age=0; path=/')
    expect(written).toContain('_ga_AB12CD=; Max-Age=0; path=/; domain=.romialkenmogne.com')
    expect(written).toContain('_gid=; Max-Age=0; path=/; domain=.www.romialkenmogne.com')
    expect(written.some((cookie) => cookie.startsWith('theme=') || cookie.startsWith('RK_'))).toBe(
      false,
    )
  })

  it('enables Google Analytics only with a valid identifier', async () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_PROVIDER', 'google')
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_SCRIPT_URL', '')
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_SITE_ID', 'G-AB12CD34EF')
    let env = await import('@/lib/env')
    expect(env.analyticsEnabled).toBe(true)
    expect(env.googleAnalyticsId).toBe('G-AB12CD34EF')

    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_SITE_ID', 'not-an-id')
    env = await import('@/lib/env')
    expect(env.analyticsEnabled).toBe(false)
    expect(env.googleAnalyticsId).toBe('')
  })
})
