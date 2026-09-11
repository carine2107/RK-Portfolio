import { describe, expect, it } from 'vitest'

import de from '@/messages/de.json'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'

type Tree = { [key: string]: string | Tree }

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result[path] = value
    else Object.assign(result, flatten(value, path))
  }
  return result
}

const flatEn = flatten(en as Tree)
const flatFr = flatten(fr as Tree)
const flatDe = flatten(de as Tree)

describe('translations', () => {
  it('French covers every English key', () => {
    const missing = Object.keys(flatEn).filter((key) => !(key in flatFr))
    expect(missing).toEqual([])
  })

  it('German covers every English key', () => {
    const missing = Object.keys(flatEn).filter((key) => !(key in flatDe))
    expect(missing).toEqual([])
  })

  it('has no extra keys in French or German', () => {
    expect(Object.keys(flatFr).filter((key) => !(key in flatEn))).toEqual([])
    expect(Object.keys(flatDe).filter((key) => !(key in flatEn))).toEqual([])
  })

  it('has no empty message', () => {
    for (const [locale, messages] of [
      ['en', flatEn],
      ['fr', flatFr],
      ['de', flatDe],
    ] as const) {
      const empty = Object.entries(messages)
        .filter(([, value]) => value.trim() === '')
        .map(([key]) => `${locale}.${key}`)
      expect(empty).toEqual([])
    }
  })

  it('keeps the same ICU placeholders in every language', () => {
    /**
     * Top-level ICU arguments only: `{count, plural, …}` and `{minutes}` count,
     * the words inside a plural branch (`one {field}`) do not.
     */
    const placeholders = (value: string) => {
      const names: string[] = []
      let depth = 0
      for (let index = 0; index < value.length; index += 1) {
        const char = value[index]
        if (char === '{') {
          if (depth === 0) {
            const match = /^\{(\w+)\s*[,}]/.exec(value.slice(index))
            if (match?.[1]) names.push(match[1])
          }
          depth += 1
        } else if (char === '}') {
          depth -= 1
        }
      }
      return names.sort()
    }

    for (const key of Object.keys(flatEn)) {
      const reference = placeholders(flatEn[key] ?? '')
      expect(placeholders(flatFr[key] ?? ''), `fr:${key}`).toEqual(reference)
      expect(placeholders(flatDe[key] ?? ''), `de:${key}`).toEqual(reference)
    }
  })

  it('translates the navigation, not just the English labels', () => {
    expect(flatFr['nav.about']).not.toEqual(flatEn['nav.about'])
    expect(flatDe['nav.about']).not.toEqual(flatEn['nav.about'])
    // The brand signature stays in English on purpose.
    expect(flatFr['brand.signature']).toEqual(flatEn['brand.signature'])
  })
})
