import { describe, expect, it } from 'vitest'

import { retentionCutoff } from '@/lib/retention'

describe('contact request retention', () => {
  const now = new Date('2026-09-14T10:00:00.000Z')

  it('keeps requests for the configured number of months', () => {
    expect(retentionCutoff(24, now)?.toISOString()).toBe('2024-09-14T10:00:00.000Z')
    expect(retentionCutoff(6, now)?.toISOString()).toBe('2026-03-14T10:00:00.000Z')
  })

  it('is disabled with 0, a negative or an invalid value', () => {
    expect(retentionCutoff(0, now)).toBeNull()
    expect(retentionCutoff(-3, now)).toBeNull()
    expect(retentionCutoff(Number.NaN, now)).toBeNull()
  })

  it('ignores fractions of a month', () => {
    expect(retentionCutoff(12.9, now)?.toISOString()).toBe('2025-09-14T10:00:00.000Z')
  })
})
