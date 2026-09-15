import { describe, expect, it } from 'vitest'

import { BRAND_COLORS, blasonSvg, markGroup, markSvg } from '@/lib/brand-mark'

describe('brand monogram', () => {
  it('is drawn with strokes only: no font, identical everywhere', () => {
    const svg = markSvg({ stroke: BRAND_COLORS.navy, accent: BRAND_COLORS.gold })
    expect(svg).not.toContain('<text')
    expect(svg.match(/<path /g)).toHaveLength(6)
    expect(svg).toContain('viewBox="0 0 100 100"')
  })

  it('paints the rising arm in the accent colour and the letters in the stroke colour', () => {
    const group = markGroup({ stroke: '#111111', accent: '#bbbbbb' })
    expect(group.match(/stroke="#111111"/g)).toHaveLength(5)
    expect(group).toContain('<path d="M57.5 54 79.5 18" stroke="#bbbbbb"/>')
  })

  it('is decorative unless a title is given', () => {
    expect(markSvg({ stroke: '#000', accent: '#000' })).toContain('aria-hidden="true"')
    expect(markSvg({ stroke: '#000', accent: '#000' }, { title: 'Romial Kenmogne' })).toContain(
      'role="img" aria-label="Romial Kenmogne"',
    )
  })

  it('builds the blason, cut-corner or full-bleed', () => {
    const colors = {
      background: BRAND_COLORS.navy,
      stroke: BRAND_COLORS.ivory,
      accent: BRAND_COLORS.goldLight,
    }
    expect(blasonSvg(colors)).toContain('L98 20')
    expect(blasonSvg(colors, { fullBleed: true })).toContain('<rect width="100" height="100"')
    expect(blasonSvg(colors, { size: 32 })).toContain('width="32" height="32"')
  })
})
