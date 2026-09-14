import { describe, expect, it, vi } from 'vitest'

// The module is server-only; the guard package throws outside React Server Components.
vi.mock('server-only', () => ({}))

const { getEuropeAfricaMap } = await import('@/lib/world-map')
const { countryName } = await import('@/lib/countries')

describe('Europe–Africa map', () => {
  const map = getEuropeAfricaMap()
  const codes = new Set(map.shapes.map((shape) => shape.code))

  it('draws the countries of Europe and Africa with their ISO codes', () => {
    for (const code of ['DE', 'FR', 'CM', 'SN', 'ZA', 'MA', 'EG', 'GB', 'NG', 'KE']) {
      expect(codes.has(code), code).toBe(true)
    }
  })

  it('leaves out countries far outside the window', () => {
    for (const code of ['US', 'BR', 'AU', 'JP']) expect(codes.has(code), code).toBe(false)
  })

  it('stays light enough to send to the browser', () => {
    const bytes = map.shapes.reduce((total, shape) => total + shape.d.length, 0)
    expect(bytes).toBeLessThan(80_000)
    expect(map.shapes.every((shape) => shape.d.startsWith('M'))).toBe(true)
  })
})

describe('country names', () => {
  it('are shown in the page language', () => {
    expect(countryName('DE', 'fr')).toBe('Allemagne')
    expect(countryName('DE', 'de')).toBe('Deutschland')
    expect(countryName('CM', 'en')).toBe('Cameroon')
    expect(countryName('XX', 'en')).toBe('')
  })
})
