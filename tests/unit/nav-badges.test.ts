import { describe, expect, it } from 'vitest'

import {
  applyBadge,
  badgeText,
  badgeTitle,
  contactCountUrl,
  NAV_BADGE_ATTRIBUTE,
  subscribersCountUrl,
} from '@/payload/components/nav-badges'

describe('admin navigation badges', () => {
  it('shows nothing for zero and caps large counts', () => {
    expect(badgeText(0)).toBeNull()
    expect(badgeText(-2)).toBeNull()
    expect(badgeText(Number.NaN)).toBeNull()
    expect(badgeText(1)).toBe('1')
    expect(badgeText(42)).toBe('42')
    expect(badgeText(250)).toBe('99+')
  })

  it('writes a readable title in the admin language', () => {
    expect(badgeTitle('contact', 1, 'fr')).toBe('1 nouvelle demande')
    expect(badgeTitle('contact', 3, 'fr')).toBe('3 nouvelles demandes')
    expect(badgeTitle('subscribers', 2, 'de')).toBe('2 neue Abonnenten')
    expect(badgeTitle('subscribers', 1, 'en')).toBe('1 new subscriber')
    expect(badgeTitle('contact', 2, 'it')).toBe('2 nouvelles demandes')
  })

  it('adds, updates and removes the badge on a navigation link', () => {
    const link = document.createElement('a')
    applyBadge(link, '3', '3 nouvelles demandes')
    expect(link.getAttribute(NAV_BADGE_ATTRIBUTE)).toBe('3')
    expect(link.getAttribute('title')).toBe('3 nouvelles demandes')
    applyBadge(link, '4', '4 nouvelles demandes')
    expect(link.getAttribute(NAV_BADGE_ATTRIBUTE)).toBe('4')
    applyBadge(link, null, '')
    expect(link.hasAttribute(NAV_BADGE_ATTRIBUTE)).toBe(false)
    expect(link.hasAttribute('title')).toBe(false)
    expect(() => applyBadge(null, '1', 'x')).not.toThrow()
  })

  it('queries only new requests and recent, still subscribed subscribers', () => {
    expect(contactCountUrl('/api/cms')).toBe(
      '/api/cms/contact-submissions?where[status][equals]=new&limit=1&depth=0',
    )
    const url = subscribersCountUrl('/api/cms', '2026-09-16T10:00:00.000Z')
    expect(url).toContain('/api/cms/subscribers?')
    expect(url).toContain('where[createdAt][greater_than]=2026-09-16T10%3A00%3A00.000Z')
    expect(url).toContain('where[status][not_equals]=unsubscribed')
  })
})
