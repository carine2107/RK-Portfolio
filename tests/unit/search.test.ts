import { describe, expect, it } from 'vitest'

import {
  anyTermWhere,
  contentTerms,
  excerpt,
  highlightParts,
  normalizeQuery,
  rankByTerms,
  searchTerms,
  termsWhere,
} from '@/lib/search'

describe('site search', () => {
  it('normalizes the query and ignores what is too short', () => {
    expect(normalizeQuery('  due   diligence ')).toBe('due diligence')
    expect(normalizeQuery(['immobilier', 'x'])).toBe('immobilier')
    expect(normalizeQuery('a')).toBe('')
    expect(normalizeQuery(undefined)).toBe('')
    expect(normalizeQuery('x'.repeat(250))).toHaveLength(100)
  })

  it('keeps distinct words of two characters or more, without surrounding punctuation', () => {
    expect(searchTerms('Due diligence, due « PME » ! a')).toEqual(['due', 'diligence', 'pme'])
    expect(searchTerms('un deux trois quatre cinq six sept')).toHaveLength(6)
  })

  it('requires every word in at least one field', () => {
    expect(
      termsWhere(['title', 'summary'], ['due', 'pme'], [{ _status: { equals: 'published' } }]),
    ).toEqual({
      and: [
        { _status: { equals: 'published' } },
        { or: [{ title: { like: 'due' } }, { summary: { like: 'due' } }] },
        { or: [{ title: { like: 'pme' } }, { summary: { like: 'pme' } }] },
      ],
    })
  })

  it('cuts an excerpt around the first match', () => {
    const text = `${'Introduction générale. '.repeat(20)}La due diligence financière vérifie les comptes. ${'Suite du texte. '.repeat(20)}`
    const short = excerpt(text, ['diligence'], 80)
    expect(short.startsWith('… ')).toBe(true)
    expect(short.endsWith(' …')).toBe(true)
    expect(short).toContain('diligence')
    expect(excerpt('Texte court', ['court'])).toBe('Texte court')
  })

  it('splits text into highlighted parts, case-insensitively', () => {
    expect(highlightParts('Due Diligence et PME', ['diligence', 'pme'])).toEqual([
      { text: 'Due ', match: false },
      { text: 'Diligence', match: true },
      { text: ' et ', match: false },
      { text: 'PME', match: true },
    ])
    expect(highlightParts('a+b (c)', ['(c)'])).toEqual([
      { text: 'a+b ', match: false },
      { text: '(c)', match: true },
    ])
  })
})

describe('context search for the assistant', () => {
  it('drops the words of a question that no page carries', () => {
    expect(contentTerms('Que propose Romial Kenmogne comme accompagnement ?')).toEqual([
      'propose',
      'romial',
      'kenmogne',
      'accompagnement',
    ])
    expect(contentTerms('Wie kann man ihn für einen Vortrag einladen?')).toEqual([
      'vortrag',
      'einladen',
    ])
    // A question made only of common words keeps them rather than searching nothing.
    expect(contentTerms('what is this')).toEqual(['what', 'is', 'this'])
  })

  it('accepts a page carrying a single word, unlike the site search', () => {
    expect(
      anyTermWhere(['title', 'summary'], ['due', 'diligence'], [{ active: { equals: true } }]),
    ).toEqual({
      and: [
        { active: { equals: true } },
        {
          or: [
            { title: { like: 'due' } },
            { summary: { like: 'due' } },
            { title: { like: 'diligence' } },
            { summary: { like: 'diligence' } },
          ],
        },
      ],
    })
  })

  it('puts the pages matching the most words first, keeping the original order on a tie', () => {
    const entries = [
      { title: 'Financement', excerpt: 'Immobilier' },
      { title: 'Due diligence financière', excerpt: 'Comptes' },
      { title: 'Diligence', excerpt: 'Audit' },
    ]
    expect(rankByTerms(entries, ['due', 'diligence']).map((entry) => entry.title)).toEqual([
      'Due diligence financière',
      'Diligence',
      'Financement',
    ])
  })
})
