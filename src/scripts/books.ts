/**
 * Writes a book from `src/content/starter.ts` into the CMS, in the three
 * languages. Shared by the seed and by the client-asset import.
 */
import type { Payload } from 'payload'

import type { StarterBook } from '../content/starter'
import { lexicalFromParagraphs } from './lexical'

type Locale = 'en' | 'fr' | 'de'
const OTHER_LOCALES: Locale[] = ['fr', 'de']

function localizedFields(book: StarterBook, locale: Locale) {
  return {
    title: book.title[locale],
    slug: book.slug[locale],
    subtitle: book.subtitle[locale],
    summary: book.summary[locale],
    audience: book.audience[locale].map((item) => ({ item })),
    description: lexicalFromParagraphs(book.description[locale]),
    seo: { title: book.seo.title[locale], description: book.seo.description[locale] },
    _status: 'published' as const,
  }
}

async function findBookBySlug(payload: Payload, slug: string) {
  const result = await payload.find({
    collection: 'books',
    locale: 'en',
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: true,
    draft: true,
  })
  return result.docs[0] ?? null
}

/**
 * Creates or updates the book. `legacySlugs` lets an older entry (such as the
 * sample book shipped before the real one was supplied) be converted in place
 * instead of leaving a duplicate behind.
 */
export async function upsertBook(
  payload: Payload,
  book: StarterBook,
  options: { coverId?: string | number; legacySlugs?: string[] } = {},
): Promise<string | number> {
  let existing = await findBookBySlug(payload, book.slug.en)
  for (const legacy of options.legacySlugs ?? []) {
    if (existing) break
    existing = await findBookBySlug(payload, legacy)
  }

  const data = {
    ...localizedFields(book, 'en'),
    author: 'Romial Kenmogne',
    availability: book.availability,
    saleType: book.saleType,
    currency: 'EUR' as const,
    featured: true,
    order: book.order,
    isPlaceholder: book.isPlaceholder,
    bookLanguage: book.bookLanguage,
    format: book.format,
    isbn: book.isbn,
    purchaseLinks: book.purchaseLinks.map((link) => ({ label: link.label.en, url: link.url })),
    ...(options.coverId !== undefined ? { cover: options.coverId } : {}),
  }

  const doc = existing
    ? await payload.update({
        collection: 'books',
        id: existing.id,
        locale: 'en',
        overrideAccess: true,
        data: data as never,
      })
    : await payload.create({
        collection: 'books',
        locale: 'en',
        overrideAccess: true,
        data: data as never,
      })

  // The purchase-link rows are shared by every language; only their label is
  // translated. Re-using the row ids keeps the three labels on the same rows.
  const rows = (doc.purchaseLinks ?? []) as { id?: string | null }[]

  for (const locale of OTHER_LOCALES) {
    await payload.update({
      collection: 'books',
      id: doc.id,
      locale,
      overrideAccess: true,
      data: {
        ...localizedFields(book, locale),
        purchaseLinks: book.purchaseLinks.map((link, index) => ({
          ...(rows[index]?.id ? { id: rows[index]?.id } : {}),
          label: link.label[locale],
          url: link.url,
        })),
      } as never,
    })
  }

  return doc.id
}
