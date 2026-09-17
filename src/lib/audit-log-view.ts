/**
 * Audit log screen (pure helpers, unit-tested): period tabs, filters, grouping
 * by day. Dates follow the owner's time zone, not the server's.
 */

export const AUDIT_TIME_ZONE = 'Europe/Berlin'
export const AUDIT_PERIODS = ['day', 'week', 'month', 'year', 'all'] as const
export type AuditPeriod = (typeof AUDIT_PERIODS)[number]
export const AUDIT_PAGE_SIZE = 200

export type AuditFilters = {
  period: AuditPeriod
  q: string
  action: string
  entity: string
  limit: number
}

const one = (value: unknown) => (Array.isArray(value) ? value[0] : value)
const text = (value: unknown, max: number) =>
  typeof one(value) === 'string' ? (one(value) as string).trim().slice(0, max) : ''

export function parseFilters(
  params: Record<string, unknown> | undefined,
  actions: readonly string[],
  entities: readonly string[],
): AuditFilters {
  const period = text(params?.period, 10)
  const action = text(params?.action, 20)
  const entity = text(params?.entity, 60)
  const limit = Number.parseInt(text(params?.limit, 6), 10)
  return {
    period: (AUDIT_PERIODS as readonly string[]).includes(period)
      ? (period as AuditPeriod)
      : 'week',
    q: text(params?.q, 100),
    action: actions.includes(action) ? action : '',
    entity: entities.includes(entity) ? entity : '',
    limit:
      Number.isFinite(limit) && limit > 0
        ? Math.min(Math.ceil(limit / AUDIT_PAGE_SIZE) * AUDIT_PAGE_SIZE, 2000)
        : AUDIT_PAGE_SIZE,
  }
}

/** Calendar parts of an instant in the given time zone. */
function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')),
  }
}

/** UTC instant of midnight on a calendar day in the time zone. */
function zonedMidnight(year: number, month: number, day: number, timeZone: string): Date {
  const guess = new Date(Date.UTC(year, month - 1, day))
  const parts = zonedParts(guess, timeZone)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  const offset = asUtc - guess.getTime()
  return new Date(guess.getTime() - offset)
}

/** Start of today, this week (Monday), this month or this year; null for everything. */
export function periodStart(
  period: AuditPeriod,
  now: Date,
  timeZone = AUDIT_TIME_ZONE,
): Date | null {
  if (period === 'all') return null
  const today = zonedParts(now, timeZone)
  if (period === 'day') return zonedMidnight(today.year, today.month, today.day, timeZone)
  if (period === 'week') {
    const monday = new Date(Date.UTC(today.year, today.month - 1, today.day - today.weekday))
    return zonedMidnight(
      monday.getUTCFullYear(),
      monday.getUTCMonth() + 1,
      monday.getUTCDate(),
      timeZone,
    )
  }
  if (period === 'month') return zonedMidnight(today.year, today.month, 1, timeZone)
  return zonedMidnight(today.year, 1, 1, timeZone)
}

export function auditWhere(filters: AuditFilters, now: Date) {
  const start = periodStart(filters.period, now)
  const and: Record<string, unknown>[] = []
  if (start) and.push({ createdAt: { greater_than_equal: start.toISOString() } })
  if (filters.action) and.push({ action: { equals: filters.action } })
  if (filters.entity) and.push({ entity: { equals: filters.entity } })
  if (filters.q) {
    and.push({
      or: ['userLabel', 'documentTitle', 'changedFields'].map((field) => ({
        [field]: { like: filters.q },
      })),
    })
  }
  return { and }
}

/** Calendar day key (YYYY-MM-DD) in the time zone. */
export function dayKey(value: string | Date, timeZone = AUDIT_TIME_ZONE): string {
  const parts = zonedParts(new Date(value), timeZone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

export function groupByDay<T extends { createdAt: string }>(
  entries: T[],
): { day: string; entries: T[] }[] {
  const groups = new Map<string, T[]>()
  for (const entry of entries) {
    const key = dayKey(entry.createdAt)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return [...groups.entries()].map(([day, items]) => ({ day, entries: items }))
}

/** Query string for the screen, keeping only non-default values. */
export function auditQuery(filters: AuditFilters, change: Partial<AuditFilters> = {}): string {
  const next = { ...filters, ...change }
  const params = new URLSearchParams()
  if (next.period !== 'week') params.set('period', next.period)
  if (next.q) params.set('q', next.q)
  if (next.action) params.set('action', next.action)
  if (next.entity) params.set('entity', next.entity)
  if (next.limit !== AUDIT_PAGE_SIZE) params.set('limit', String(next.limit))
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** First letter shown in the user badge. */
export function initial(label: string): string {
  const letter = label.trim().match(/\p{L}|\p{N}/u)?.[0]
  return letter ? letter.toUpperCase() : '?'
}
