/**
 * Protected product data for members who own the product: files and course
 * lessons. Always called after an entitlement check.
 */
import type { Payload } from 'payload'

import type { Locale } from '@/i18n/routing'

export type ProtectedFile = { id: string; filename: string; mimeType: string; filesize: number }

export type Lesson = {
  id: string
  title: string
  durationMinutes: number | null
  content: unknown
  videoUrl: string
  attachment: ProtectedFile | null
}

export type ProtectedProduct = {
  id: string
  slug: string
  type: 'ebook' | 'course' | 'resource'
  title: string
  summary: string
  pdf: ProtectedFile | null
  epub: ProtectedFile | null
  resource: ProtectedFile | null
  modules: { title: string; lessons: Lesson[] }[]
}

const file = (value: unknown): ProtectedFile | null => {
  if (!value || typeof value !== 'object') return null
  const doc = value as Record<string, unknown>
  if (typeof doc.filename !== 'string') return null
  return {
    id: String(doc.id),
    filename: doc.filename,
    mimeType: typeof doc.mimeType === 'string' ? doc.mimeType : 'application/octet-stream',
    filesize: typeof doc.filesize === 'number' ? doc.filesize : 0,
  }
}

const mapProduct = (doc: Record<string, unknown>): ProtectedProduct => ({
  id: String(doc.id),
  slug: typeof doc.slug === 'string' ? doc.slug : '',
  type: (doc.type as ProtectedProduct['type']) ?? 'ebook',
  title: typeof doc.title === 'string' ? doc.title : '',
  summary: typeof doc.summary === 'string' ? doc.summary : '',
  pdf: file(doc.ebookPdf),
  epub: file(doc.ebookEpub),
  resource: file(doc.resourceFile),
  modules: (Array.isArray(doc.modules) ? doc.modules : []).map((module) => {
    const moduleDoc = module as Record<string, unknown>
    return {
      title: typeof moduleDoc.title === 'string' ? moduleDoc.title : '',
      lessons: (Array.isArray(moduleDoc.lessons) ? moduleDoc.lessons : []).map((lesson) => {
        const lessonDoc = lesson as Record<string, unknown>
        return {
          id: String(lessonDoc.id),
          title: typeof lessonDoc.title === 'string' ? lessonDoc.title : '',
          durationMinutes:
            typeof lessonDoc.durationMinutes === 'number' ? lessonDoc.durationMinutes : null,
          content: lessonDoc.content ?? null,
          videoUrl: typeof lessonDoc.videoUrl === 'string' ? lessonDoc.videoUrl : '',
          attachment: file(lessonDoc.attachment),
        }
      }),
    }
  }),
})

export async function protectedProductById(
  payload: Payload,
  id: string | number,
  locale: Locale,
): Promise<ProtectedProduct | null> {
  try {
    const doc = await payload.findByID({
      collection: 'products',
      id,
      locale,
      depth: 1,
      overrideAccess: true,
    })
    return doc._status === 'published'
      ? mapProduct(doc as unknown as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function protectedProductBySlug(
  payload: Payload,
  slug: string,
  locale: Locale,
): Promise<ProtectedProduct | null> {
  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    locale,
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  return doc ? mapProduct(doc as unknown as Record<string, unknown>) : null
}

export function allLessons(product: ProtectedProduct): Lesson[] {
  return product.modules.flatMap((module) => module.lessons)
}
