/**
 * Site search helpers (pure, unit-tested): query normalisation, CMS filters,
 * excerpts and highlighted parts. The queries themselves run in
 * src/lib/search-cms.ts.
 */

export const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 100
const MAX_TERMS = 6

/** Trimmed, single-spaced, at most 100 characters; empty when too short. */
export function normalizeQuery(raw: unknown): string {
  const value = (Array.isArray(raw) ? raw[0] : raw) ?? ''
  if (typeof value !== 'string') return ''
  const query = value.replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH).trim()
  return query.length >= MIN_QUERY_LENGTH ? query : ''
}

/** Distinct words of at least two characters, six at most. */
export function searchTerms(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(' ')
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((word) => word.length >= MIN_QUERY_LENGTH)
  return [...new Set(words)].slice(0, MAX_TERMS)
}

type Condition = Record<string, unknown>

/** Every term must appear in at least one of the fields (case-insensitive `like`). */
export function termsWhere(fields: string[], terms: string[], extra: Condition[] = []) {
  return {
    and: [
      ...extra,
      ...terms.map((term) => ({ or: fields.map((field) => ({ [field]: { like: term } })) })),
    ],
  }
}

const fold = (value: string) => value.toLowerCase()

/** Short excerpt around the first matching term, with ellipses where cut. */
export function excerpt(text: string, terms: string[], length = 180): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= length) return clean
  const lower = fold(clean)
  const positions = terms.map((term) => lower.indexOf(fold(term))).filter((index) => index >= 0)
  const first = positions.length > 0 ? Math.min(...positions) : 0
  let start = Math.max(0, first - Math.floor(length / 3))
  if (start > 0) {
    const space = clean.indexOf(' ', start)
    start = space >= 0 && space < first ? space + 1 : start
  }
  let end = Math.min(clean.length, start + length)
  if (end < clean.length) {
    const space = clean.lastIndexOf(' ', end)
    end = space > start ? space : end
  }
  return `${start > 0 ? '… ' : ''}${clean.slice(start, end).trim()}${end < clean.length ? ' …' : ''}`
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Text split into plain and matching parts, for <mark> highlighting. */
export function highlightParts(text: string, terms: string[]): { text: string; match: boolean }[] {
  if (terms.length === 0 || !text) return [{ text, match: false }]
  const pattern = new RegExp(
    `(${[...terms]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|')})`,
    'giu',
  )
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: terms.some((term) => fold(term) === fold(part)) }))
}
