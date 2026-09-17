/**
 * Pure helpers for the admin dashboard (AdminDashboard.tsx): calendar months,
 * labels and bar sizes. Unit-tested.
 */

export type Language = 'fr' | 'de' | 'en'

export type MonthRange = { key: string; start: Date; end: Date }

export function adminLanguage(language: string | undefined): Language {
  return language === 'de' || language === 'en' ? language : 'fr'
}

/** The last `count` calendar months (UTC), oldest first, the current one last. */
export function lastMonths(now: Date, count: number): MonthRange[] {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index
    const start = new Date(Date.UTC(year, month - offset, 1))
    const end = new Date(Date.UTC(year, month - offset + 1, 1))
    const key = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`
    return { key, start, end }
  })
}

const LOCALES: Record<Language, string> = { fr: 'fr-FR', de: 'de-DE', en: 'en-GB' }

/** "sept. 2026" / "Sep 2026" for a month range. */
export function monthLabel(range: MonthRange, language: Language): string {
  return new Intl.DateTimeFormat(LOCALES[language], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(range.start)
}

export function shortDate(value: string | Date, language: Language): string {
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

/** Bar lengths in percent of the largest value; a non-zero value stays visible. */
export function barPercents(values: number[]): number[] {
  const max = Math.max(0, ...values)
  if (max === 0) return values.map(() => 0)
  return values.map((value) => (value > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0))
}

/** Change against the previous month, as shown under a figure. */
export function monthChange(
  current: number,
  previous: number,
  language: Language,
): { text: string; trend: 'up' | 'down' | 'flat' } {
  const diff = current - previous
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
  const signed = diff > 0 ? `+${diff}` : String(diff)
  const text = {
    fr: diff === 0 ? 'comme le mois dernier' : `${signed} par rapport au mois dernier`,
    de: diff === 0 ? 'wie im Vormonat' : `${signed} gegenüber dem Vormonat`,
    en: diff === 0 ? 'same as last month' : `${signed} on last month`,
  }[language]
  return { text, trend }
}

/** Admin list URL filtered with Payload's `where` query syntax. */
export function listUrl(
  adminRoute: string,
  collection: string,
  where: Record<string, Record<string, string>> = {},
): string {
  const query = Object.entries(where)
    .flatMap(([field, conditions]) =>
      Object.entries(conditions).map(
        ([operator, value]) => `where[${field}][${operator}]=${encodeURIComponent(value)}`,
      ),
    )
    .join('&')
  return `${adminRoute}/collections/${collection}${query ? `?${query}` : ''}`
}
