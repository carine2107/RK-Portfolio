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
export function searchTerms(query: string, max = MAX_TERMS): string[] {
  const words = query
    .toLowerCase()
    .split(' ')
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((word) => word.length >= MIN_QUERY_LENGTH)
  return [...new Set(words)].slice(0, max)
}

/**
 * Words carried by a question but by no title or summary. Removed before the
 * assistant looks for pages, so "Que propose Romial Kenmogne ?" searches
 * "propose" rather than failing on "que".
 */
const fold = (value: string) => value.toLowerCase()

const STOPWORDS = new Set([
  // French
  'au',
  'aux',
  'avec',
  'ce',
  'ces',
  'dans',
  'de',
  'des',
  'du',
  'elle',
  'en',
  'est',
  'et',
  'eux',
  'il',
  'ils',
  'je',
  'la',
  'le',
  'les',
  'leur',
  'lui',
  'ma',
  'mais',
  'me',
  'mes',
  'moi',
  'mon',
  'ne',
  'nos',
  'notre',
  'nous',
  'on',
  'ou',
  'par',
  'pas',
  'pour',
  'qu',
  'que',
  'qui',
  'quoi',
  'sa',
  'se',
  'ses',
  'son',
  'sur',
  'ta',
  'te',
  'tes',
  'toi',
  'ton',
  'tu',
  'un',
  'une',
  'vos',
  'votre',
  'vous',
  'comme',
  'quel',
  'quelle',
  'quels',
  'quelles',
  'combien',
  'comment',
  'pourquoi',
  'quand',
  'faire',
  'fait',
  'sont',
  'etre',
  'être',
  'avoir',
  'plus',
  'tout',
  'tous',
  'toute',
  'toutes',
  // German
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einen',
  'einem',
  'einer',
  'und',
  'oder',
  'aber',
  'auch',
  'auf',
  'aus',
  'bei',
  'bis',
  'durch',
  'für',
  'fur',
  'gegen',
  'ich',
  'ihr',
  'ist',
  'mit',
  'nach',
  'nicht',
  'noch',
  'nur',
  'sie',
  'sind',
  'über',
  'uber',
  'um',
  'von',
  'vor',
  'was',
  'wer',
  'wie',
  'wo',
  'warum',
  'wann',
  'welche',
  'welcher',
  'kann',
  'sich',
  'haben',
  'sein',
  'man',
  'ihn',
  'ihm',
  'ihnen',
  'als',
  'am',
  'im',
  'zu',
  'zum',
  'zur',
  'gibt',
  'soll',
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  // English
  'is',
  'in',
  'of',
  'on',
  'to',
  'at',
  'as',
  'by',
  'it',
  'be',
  'or',
  'an',
  'was',
  'were',
  'about',
  'and',
  'are',
  'can',
  'did',
  'does',
  'for',
  'from',
  'has',
  'have',
  'how',
  'into',
  'its',
  'may',
  'not',
  'does',
  'the',
  'their',
  'them',
  'there',
  'they',
  'this',
  'that',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'will',
  'with',
  'you',
  'your',
  'does',
  'could',
  'would',
  'should',
  'tell',
  'give',
  'need',
  'want',
])

/** Terms worth searching: meaningful words first, the raw ones as a fallback. */
export function contentTerms(query: string): string[] {
  // Common words are dropped **before** the limit, so a full sentence does not
  // spend its budget on "wie", "kann" or "que".
  const terms = searchTerms(query, MAX_TERMS * 4)
  const kept = terms.filter((term) => !STOPWORDS.has(term))
  return (kept.length > 0 ? kept : terms).slice(0, MAX_TERMS)
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

/** At least one term in one of the fields: used to find context, not to list results. */
export function anyTermWhere(fields: string[], terms: string[], extra: Condition[] = []) {
  return {
    and: [
      ...extra,
      { or: terms.flatMap((term) => fields.map((field) => ({ [field]: { like: term } }))) },
    ],
  }
}

/** Pages that match the most words first; ties keep the order of the source. */
export function rankByTerms<T extends { title: string; excerpt: string }>(
  entries: T[],
  terms: string[],
): T[] {
  const score = (entry: T) => {
    const haystack = fold(`${entry.title} ${entry.excerpt}`)
    return terms.filter((term) => haystack.includes(fold(term))).length
  }
  return entries
    .map((entry, index) => ({ entry, index, score: score(entry) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.entry)
}

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
