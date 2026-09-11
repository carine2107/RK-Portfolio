import type { Locale } from '@/i18n/routing'

const DATE_LOCALES: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
}

export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatMonthYear(value: string | null | undefined, locale: Locale): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatPeriod(
  start: string,
  end: string | null,
  locale: Locale,
  ongoingLabel: string,
): string {
  const from = formatMonthYear(start, locale)
  const to = end ? formatMonthYear(end, locale) : ongoingLabel
  if (!from) return to
  return `${from} — ${to}`
}

export function formatPrice(value: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(DATE_LOCALES[locale], {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${value} ${currency}`
  }
}

/** ISO 8601 date used by `<time datetime="…">`. */
export function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
