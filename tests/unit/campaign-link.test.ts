import { describe, expect, it } from 'vitest'

import { resolveCampaignLink } from '@/lib/campaign-link'

describe('campaign button targets', () => {
  it('keeps site pages internal and removes a typed language prefix', () => {
    expect(resolveCampaignLink('/contact?type=speaking')).toEqual({
      href: '/contact?type=speaking',
      external: false,
    })
    expect(resolveCampaignLink('/fr/books/mon-livre')).toEqual({
      href: '/books/mon-livre',
      external: false,
    })
    expect(resolveCampaignLink('/de')).toEqual({ href: '/', external: false })
    expect(resolveCampaignLink('/french-market')).toEqual({
      href: '/french-market',
      external: false,
    })
  })

  it('accepts https addresses as external links', () => {
    expect(resolveCampaignLink('https://example.com/event')).toEqual({
      href: 'https://example.com/event',
      external: true,
    })
  })

  it('rejects unsafe or malformed targets', () => {
    for (const value of [
      '',
      '   ',
      'http://example.com',
      'javascript:alert(1)',
      '//evil.example',
      '/with space',
      'contact',
      'mailto:someone@example.com',
      null,
      undefined,
    ]) {
      expect(resolveCampaignLink(value)).toBeNull()
    }
  })
})
