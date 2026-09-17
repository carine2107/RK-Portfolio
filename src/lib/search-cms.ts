import 'server-only'

import type { CollectionSlug, Where } from 'payload'

import type { Locale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { excerpt, searchTerms, termsWhere } from '@/lib/search'

export type SearchGroup =
  | 'insights'
  | 'expertise'
  | 'experience'
  | 'books'
  | 'speaking'
  | 'businesses'
  | 'products'

export type SearchResult = { id: string; title: string; excerpt: string; href: string }

export type SearchResults = { group: SearchGroup; results: SearchResult[] }[]

type Source = {
  group: SearchGroup
  collection: CollectionSlug
  titleField: string
  fields: string[]
  textField: string
  href: (slug: string) => string
  extra?: () => Where[]
}

const PER_GROUP = 10

/** Public content searched, in the order the groups are shown. */
const SOURCES: Source[] = [
  {
    group: 'insights',
    collection: 'insights',
    titleField: 'title',
    fields: ['title', 'excerpt'],
    textField: 'excerpt',
    href: (slug) => `/insights/${slug}`,
    // Scheduled articles stay hidden until their publication date.
    extra: () => [
      {
        or: [
          { publishedAt: { less_than_equal: new Date().toISOString() } },
          { publishedAt: { exists: false } },
        ],
      },
    ],
  },
  {
    group: 'expertise',
    collection: 'expertise-areas',
    titleField: 'title',
    fields: ['title', 'summary'],
    textField: 'summary',
    href: (slug) => `/expertise/${slug}`,
  },
  {
    group: 'experience',
    collection: 'experiences',
    titleField: 'title',
    fields: ['title', 'summary', 'organisation', 'role'],
    textField: 'summary',
    href: (slug) => `/experience/${slug}`,
  },
  {
    group: 'books',
    collection: 'books',
    titleField: 'title',
    fields: ['title', 'subtitle', 'summary'],
    textField: 'summary',
    href: (slug) => `/books/${slug}`,
  },
  {
    group: 'speaking',
    collection: 'engagements',
    titleField: 'title',
    fields: ['title', 'summary'],
    textField: 'summary',
    href: (slug) => `/speaking/${slug}`,
  },
  {
    group: 'businesses',
    collection: 'businesses',
    titleField: 'name',
    fields: ['name', 'tagline', 'description'],
    textField: 'description',
    href: () => '/businesses',
    extra: () => [{ active: { equals: true } }],
  },
  {
    group: 'products',
    collection: 'products',
    titleField: 'title',
    fields: ['title', 'summary'],
    textField: 'summary',
    href: (slug) => `/products/${slug}`,
  },
]

const text = (value: unknown) => (typeof value === 'string' ? value : '')

/**
 * Published content matching every word of the query, in the visitor's
 * language, grouped by section. Access control applies as for an anonymous
 * visitor (`overrideAccess: false`): drafts and private data never match.
 */
export async function searchSite(query: string, locale: Locale): Promise<SearchResults> {
  const terms = searchTerms(query)
  const cms = await getCms()
  if (!cms || terms.length === 0) return []

  const groups = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const found = await cms.find({
          collection: source.collection,
          locale,
          depth: 0,
          limit: PER_GROUP,
          overrideAccess: false,
          where: termsWhere(source.fields, terms, [
            { _status: { equals: 'published' } },
            ...(source.extra?.() ?? []),
          ]) as Where,
        })
        const results = found.docs.flatMap((doc) => {
          const record = doc as unknown as Record<string, unknown>
          const slug = text(record.slug)
          const title = text(record[source.titleField])
          if (!title || (!slug && source.group !== 'businesses')) return []
          return [
            {
              id: `${source.group}-${String(record.id)}`,
              title,
              excerpt: excerpt(text(record[source.textField]), terms),
              href: source.href(slug),
            },
          ]
        })
        return { group: source.group, results }
      } catch (error) {
        console.warn(
          `[search] ${source.collection} unavailable:`,
          error instanceof Error ? error.message : 'unknown error',
        )
        return { group: source.group, results: [] }
      }
    }),
  )
  return groups.filter((group) => group.results.length > 0)
}
