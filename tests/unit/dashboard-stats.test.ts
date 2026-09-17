import { describe, expect, it } from 'vitest'

import {
  adminLanguage,
  barPercents,
  lastMonths,
  listUrl,
  monthChange,
  monthLabel,
} from '@/payload/components/dashboard-stats'

describe('admin dashboard figures', () => {
  it('lists the last calendar months, oldest first, across a year change', () => {
    const months = lastMonths(new Date('2026-02-17T10:00:00Z'), 4)
    expect(months.map((month) => month.key)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02'])
    expect(months[3]!.start.toISOString()).toBe('2026-02-01T00:00:00.000Z')
    expect(months[3]!.end.toISOString()).toBe('2026-03-01T00:00:00.000Z')
  })

  it('names months in the admin language', () => {
    const [month] = lastMonths(new Date('2026-09-17T10:00:00Z'), 1)
    expect(monthLabel(month!, 'de')).toMatch(/Sept?\.? 2026/)
    expect(monthLabel(month!, 'en')).toMatch(/Sep.* 2026/)
    expect(adminLanguage('it')).toBe('fr')
  })

  it('sizes bars against the largest value and keeps small ones visible', () => {
    expect(barPercents([0, 0])).toEqual([0, 0])
    expect(barPercents([10, 5, 0, 1])).toEqual([100, 50, 0, 10])
    expect(barPercents([200, 1])).toEqual([100, 4])
  })

  it('describes the change against last month', () => {
    expect(monthChange(5, 3, 'fr')).toEqual({ text: '+2 par rapport au mois dernier', trend: 'up' })
    expect(monthChange(1, 4, 'en')).toEqual({ text: '-3 on last month', trend: 'down' })
    expect(monthChange(2, 2, 'de')).toEqual({ text: 'wie im Vormonat', trend: 'flat' })
  })

  it('builds filtered admin list links', () => {
    expect(listUrl('/admin', 'subscribers')).toBe('/admin/collections/subscribers')
    expect(
      listUrl('/admin', 'contact-submissions', {
        priority: { equals: 'high' },
        status: { in: 'new,inProgress' },
      }),
    ).toBe(
      '/admin/collections/contact-submissions?where[priority][equals]=high&where[status][in]=new%2CinProgress',
    )
  })
})
