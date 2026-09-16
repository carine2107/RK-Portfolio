import type { Metadata } from 'next'

import { defaultLocale, locales, type Locale } from '@/i18n/routing'
import { siteUrl } from '@/lib/env'

export type LocalePaths = Partial<Record<Locale, string>>

/** Absolute URL for a locale + path (`/insights/slug`). */
export function absoluteUrl(locale: Locale, path = ''): string {
  const clean = path === '/' ? '' : path
  return `${siteUrl}/${locale}${clean}`
}

/**
 * Canonical + hreflang alternates.
 *
 * `paths` allows a different path per language, which is required for entries
 * whose slug is translated. Languages without an equivalent page are omitted so
 * that no hreflang points at a 404.
 */
export function buildAlternates(
  locale: Locale,
  path: string,
  paths?: LocalePaths,
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}

  for (const candidate of locales) {
    const localePath = paths ? paths[candidate] : path
    if (localePath === undefined) continue
    languages[candidate] = absoluteUrl(candidate, localePath)
  }

  const defaultPath = paths ? paths[defaultLocale] : path
  if (defaultPath !== undefined) {
    languages['x-default'] = absoluteUrl(defaultLocale, defaultPath)
  }

  const currentPath = paths ? (paths[locale] ?? path) : path

  return {
    canonical: absoluteUrl(locale, currentPath),
    languages,
  }
}

export type PageMetadataInput = {
  locale: Locale
  path: string
  paths?: LocalePaths
  title: string
  description: string
  image?: string | null
  noindex?: boolean
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string | null
  siteName?: string
}

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_GB',
  fr: 'fr_FR',
  de: 'de_DE',
}

export function pageMetadata({
  locale,
  path,
  paths,
  title,
  description,
  image,
  noindex = false,
  type = 'website',
  publishedTime,
  siteName = 'Romial Kenmogne',
}: PageMetadataInput): Metadata {
  const alternates = buildAlternates(locale, path, paths)
  const url = alternates.canonical as string
  const ogImage = image ?? '/og-default.png'

  return {
    title,
    description,
    alternates,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: type === 'profile' ? 'profile' : type,
      title,
      description,
      url,
      siteName,
      locale: OG_LOCALES[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => OG_LOCALES[item]),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

/** Truncates a description to a sensible meta length without cutting a word. */
export function metaDescription(input: string, max = 158): string {
  const text = input.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`
}
