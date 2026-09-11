import { describe, expect, it } from 'vitest'

import { buildAlternates, metaDescription, pageMetadata } from '@/lib/seo'
import { slugify } from '@/payload/fields/shared'

describe('alternates', () => {
  it('lists the three languages and an x-default', () => {
    const alternates = buildAlternates('fr', '/expertise')
    const languages = alternates.languages as Record<string, string>

    expect(alternates.canonical).toMatch(/\/fr\/expertise$/)
    expect(Object.keys(languages).sort()).toEqual(['de', 'en', 'fr', 'x-default'])
    expect(languages['x-default']).toEqual(languages.en)
  })

  it('uses the translated path of each language when given', () => {
    const alternates = buildAlternates('de', '/insights/a', {
      en: '/insights/reading-a-balance-sheet',
      fr: '/insights/lire-un-bilan',
      de: '/insights/eine-bilanz-lesen',
    })
    const languages = alternates.languages as Record<string, string>

    expect(languages.fr).toMatch(/\/fr\/insights\/lire-un-bilan$/)
    expect(alternates.canonical).toMatch(/\/de\/insights\/eine-bilanz-lesen$/)
  })

  it('omits a language that has no equivalent page', () => {
    const alternates = buildAlternates('en', '/books/x', { en: '/books/x', fr: '/books/y' })
    const languages = alternates.languages as Record<string, string>
    expect(languages.de).toBeUndefined()
  })
})

describe('page metadata', () => {
  it('produces canonical, robots and Open Graph data', () => {
    const meta = pageMetadata({
      locale: 'en',
      path: '/about',
      title: 'About',
      description: 'Executive biography',
    })

    expect(meta.alternates?.canonical).toMatch(/\/en\/about$/)
    expect(meta.robots).toEqual({ index: true, follow: true })
    expect(meta.openGraph?.locale).toBe('en_GB')
    expect(meta.twitter).toBeTruthy()
  })

  it('marks a page as noindex when asked', () => {
    const meta = pageMetadata({
      locale: 'de',
      path: '/legal/agb',
      title: 'AGB',
      description: 'Entwurf',
      noindex: true,
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })
})

describe('helpers', () => {
  it('truncates a description without cutting a word', () => {
    const long = 'Lorem ipsum dolor sit amet, '.repeat(20)
    const result = metaDescription(long)
    expect(result.length).toBeLessThanOrEqual(160)
    expect(result.endsWith('…')).toBe(true)
  })

  it('builds accent-free, url-safe slugs', () => {
    expect(slugify('Éducation financière & investissement')).toBe(
      'education-financiere-investissement',
    )
    expect(slugify('Lire un bilan sans être comptable')).toBe('lire-un-bilan-sans-etre-comptable')
    expect(slugify('  Multiple   spaces  ')).toBe('multiple-spaces')
  })
})
