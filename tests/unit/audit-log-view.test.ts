import { describe, expect, it } from 'vitest'

import {
  auditQuery,
  auditWhere,
  dayKey,
  groupByDay,
  initial,
  parseFilters,
  periodStart,
} from '@/lib/audit-log-view'

// Thursday 17 September 2026, 00:30 in Berlin (22:30 UTC the day before).
const NOW = new Date('2026-09-16T22:30:00.000Z')

describe('audit log screen', () => {
  it('starts periods at midnight in Berlin, weeks on Monday', () => {
    expect(periodStart('day', NOW)?.toISOString()).toBe('2026-09-16T22:00:00.000Z')
    expect(periodStart('week', NOW)?.toISOString()).toBe('2026-09-13T22:00:00.000Z')
    expect(periodStart('month', NOW)?.toISOString()).toBe('2026-08-31T22:00:00.000Z')
    expect(periodStart('year', NOW)?.toISOString()).toBe('2025-12-31T23:00:00.000Z')
    expect(periodStart('all', NOW)).toBeNull()
  })

  it('reads the filters from the address, with safe defaults', () => {
    const actions = ['login', 'update']
    const entities = ['books', 'global:site-settings']
    expect(parseFilters({}, actions, entities)).toEqual({
      period: 'week',
      q: '',
      action: '',
      entity: '',
      limit: 200,
    })
    expect(
      parseFilters(
        { period: 'month', q: ' romial ', action: 'login', entity: 'books', limit: '250' },
        actions,
        entities,
      ),
    ).toEqual({ period: 'month', q: 'romial', action: 'login', entity: 'books', limit: 400 })
    expect(
      parseFilters(
        { period: 'decade', action: 'drop', entity: 'users; --', limit: '999999' },
        actions,
        entities,
      ),
    ).toMatchObject({ period: 'week', action: '', entity: '', limit: 2000 })
  })

  it('builds the query for the chosen filters', () => {
    const filters = {
      period: 'day' as const,
      q: 'livre',
      action: 'update',
      entity: 'books',
      limit: 200,
    }
    expect(auditWhere(filters, NOW)).toEqual({
      and: [
        { createdAt: { greater_than_equal: '2026-09-16T22:00:00.000Z' } },
        { action: { equals: 'update' } },
        { entity: { equals: 'books' } },
        {
          or: [
            { userLabel: { like: 'livre' } },
            { documentTitle: { like: 'livre' } },
            { changedFields: { like: 'livre' } },
          ],
        },
      ],
    })
    expect(auditQuery(filters, { period: 'week', limit: 200 })).toBe(
      '?q=livre&action=update&entity=books',
    )
    expect(auditQuery({ ...filters, q: '', action: '', entity: '' }, { period: 'week' })).toBe('')
  })

  it('groups entries by Berlin calendar day, in the given order', () => {
    const entries = [
      { id: 1, createdAt: '2026-09-16T22:10:00.000Z' },
      { id: 2, createdAt: '2026-09-16T21:50:00.000Z' },
      { id: 3, createdAt: '2026-09-16T08:00:00.000Z' },
    ]
    expect(dayKey(entries[0]!.createdAt)).toBe('2026-09-17')
    expect(groupByDay(entries).map((group) => [group.day, group.entries.length])).toEqual([
      ['2026-09-17', 1],
      ['2026-09-16', 2],
    ])
    expect(initial('  romial Kenmogne')).toBe('R')
    expect(initial('—')).toBe('?')
  })
})
