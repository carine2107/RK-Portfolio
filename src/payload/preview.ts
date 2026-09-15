import type { CollectionConfig } from 'payload'

type PreviewUrl = NonNullable<NonNullable<CollectionConfig['admin']>['preview']>

/**
 * "Preview" button of an editing screen. It opens the public page through
 * `/api/preview`, which enables draft mode for a signed-in administrator or
 * editor only. `section` is the public path; the entry's slug is appended unless
 * the collection has no page of its own (`withSlug = false`). No button while the
 * entry has no slug yet.
 */
export const previewUrl =
  (section: string, withSlug = true): PreviewUrl =>
  (doc, { locale }) => {
    const slug = typeof doc?.slug === 'string' ? doc.slug : ''
    if (withSlug && !slug) return null
    const path = withSlug ? `${section}/${slug}` : section
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4313'
    return `${base}/api/preview?locale=${locale ?? 'en'}&path=${encodeURIComponent(path)}`
  }
