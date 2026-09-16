import { describe, expect, it } from 'vitest'

import { displayHost, safeHttpsUrl, websiteUrl } from '@/lib/url'

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

describe('websiteUrl', () => {
  it('adds https:// to an address typed without a scheme', () => {
    expect(websiteUrl('www.rk-businessconsulting.com')).toBe(
      'https://www.rk-businessconsulting.com/',
    )
    expect(websiteUrl('  example.com/contact ')).toBe('https://example.com/contact')
    expect(websiteUrl('//example.com')).toBe('https://example.com/')
  })

  it('keeps complete http and https addresses', () => {
    expect(websiteUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1')
    expect(websiteUrl('http://example.com')).toBe('http://example.com/')
  })

  it('drops anything that is not a public web address', () => {
    for (const value of [
      '',
      null,
      undefined,
      'javascript:alert(1)',
      'mailto:contact@example.com',
      'ftp://example.com',
      'localhost:3000',
      'not a url',
      'intranet',
      'https://user:secret@example.com',
    ]) {
      expect(websiteUrl(value), String(value)).toBe('')
    }
  })
})
