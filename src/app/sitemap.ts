import type { MetadataRoute } from 'next'

import { locales, type Locale } from '@/i18n/routing'
import { getBooks, getExperiences, getExpertiseAreas, getInsights, getLegalPages } from '@/lib/cms'
import { siteUrl } from '@/lib/env'

/** Rebuilt at most once an hour. */
export const revalidate = 3600

type Entry = MetadataRoute.Sitemap[number]

const STATIC_PATHS = [
  { path: '', priority: 1, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/expertise', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/experience', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/insights', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/books', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/businesses', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' as const },
]

/** Builds the `alternates.languages` map for one logical page. */
function alternatesFor(paths: Partial<Record<Locale, string>>): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    const path = paths[locale]
    if (path !== undefined) languages[locale] = `${siteUrl}/${locale}${path}`
  }
  return languages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: Entry[] = []
  const now = new Date()

  for (const item of STATIC_PATHS) {
    const paths = Object.fromEntries(locales.map((locale) => [locale, item.path])) as Record<
      Locale,
      string
    >
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${item.path}`,
        lastModified: now,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: { languages: alternatesFor(paths) },
      })
    }
  }

  // Collections: slugs differ per language, so entries are grouped by CMS id.
  const collections: {
    prefix: string
    fetch: (locale: Locale) => Promise<{ id: string; slug: string; seo?: { noindex?: boolean } }[]>
    priority: number
    changeFrequency: Entry['changeFrequency']
  }[] = [
    { prefix: '/expertise', fetch: getExpertiseAreas, priority: 0.8, changeFrequency: 'monthly' },
    { prefix: '/experience', fetch: getExperiences, priority: 0.6, changeFrequency: 'monthly' },
    { prefix: '/insights', fetch: getInsights, priority: 0.7, changeFrequency: 'weekly' },
    { prefix: '/books', fetch: getBooks, priority: 0.6, changeFrequency: 'monthly' },
  ]

  for (const collection of collections) {
    const byLocale = new Map<Locale, { id: string; slug: string; seo?: { noindex?: boolean } }[]>()
    for (const locale of locales) {
      byLocale.set(locale, await collection.fetch(locale))
    }

    const reference = byLocale.get(locales[0]) ?? []
    for (const entry of reference) {
      if (entry.seo?.noindex) continue
      const paths: Partial<Record<Locale, string>> = {}
      for (const locale of locales) {
        const match = byLocale.get(locale)?.find((item) => item.id === entry.id)
        if (match) paths[locale] = `${collection.prefix}/${match.slug}`
      }
      for (const locale of locales) {
        const path = paths[locale]
        if (!path) continue
        entries.push({
          url: `${siteUrl}/${locale}${path}`,
          lastModified: now,
          changeFrequency: collection.changeFrequency,
          priority: collection.priority,
          alternates: { languages: alternatesFor(paths) },
        })
      }
    }
  }

  // Legal pages are only listed once they no longer carry the "draft" flag.
  for (const locale of locales) {
    const pages = await getLegalPages(locale)
    for (const page of pages) {
      if (page.needsLegalReview || page.seo.noindex) continue
      entries.push({
        url: `${siteUrl}/${locale}/legal/${page.slug}`,
        lastModified: page.lastUpdated ? new Date(page.lastUpdated) : now,
        changeFrequency: 'yearly',
        priority: 0.3,
      })
    }
  }

  return entries
}
