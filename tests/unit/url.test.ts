import { describe, expect, it } from 'vitest'

import { displayHost, safeHttpsUrl } from '@/lib/url'

describe('external URLs entered in the CMS', () => {
  it('keeps absolute https links', () => {
    expect(safeHttpsUrl('https://cal.com/romial-kenmogne/30min')).toBe(
      'https://cal.com/romial-kenmogne/30min',
    )
    expect(safeHttpsUrl('  https://calendly.com/rk/intro ')).toBe('https://calendly.com/rk/intro')
  })

  it('drops everything else', () => {
    for (const value of [
      '',
      null,
      undefined,
      'http://cal.com/rk',
      'javascript:alert(1)',
      '/contact',
      'cal.com/rk',
      'https://localhost/rk',
    ]) {
      expect(safeHttpsUrl(value), String(value)).toBe('')
    }
  })

  it('shows the host name of the destination', () => {
    expect(displayHost('https://www.calendly.com/rk')).toBe('calendly.com')
    expect(displayHost('https://cal.com/rk')).toBe('cal.com')
    expect(displayHost('nope')).toBe('')
  })
})
