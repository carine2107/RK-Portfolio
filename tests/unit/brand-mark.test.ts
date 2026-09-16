import { describe, expect, it } from 'vitest'

import { BRAND_COLORS, MARK_RING, markSvg } from '@/lib/brand-mark'

describe('brand mark', () => {
  const { navy, gold } = BRAND_COLORS

  it('draws the two ring halves and the letters in their colours', () => {
    const svg = markSvg({ primary: navy, accent: gold })
    expect(svg).toContain(`<path d="${MARK_RING.left}" fill="none" stroke="${navy}"`)
    expect(svg).toContain(`<path d="${MARK_RING.right}" fill="none" stroke="${gold}"`)
    expect(svg).toMatch(new RegExp(`fill="${navy}">R</text>`))
    expect(svg).toMatch(new RegExp(`fill="${gold}">K</text>`))
    // The K is drawn after the R, so it overlaps it as in the logo.
    expect(svg.indexOf('>R</text>')).toBeLessThan(svg.indexOf('>K</text>'))
  })

  it('is decorative unless a title is given', () => {
    expect(markSvg({ primary: navy, accent: gold })).toContain('aria-hidden="true"')
    const titled = markSvg({ primary: navy, accent: gold }, { title: 'Romial Kenmogne', size: 48 })
    expect(titled).toContain('role="img"')
    expect(titled).toContain('<title>Romial Kenmogne</title>')
    expect(titled).toContain('width="48" height="48"')
  })

  it('keeps a gap between the two halves of the ring', () => {
    const start = (d: string) => Number(d.slice(1).split(' ')[0])
    expect(start(MARK_RING.right) - start(MARK_RING.left)).toBeGreaterThan(0)
  })
})
