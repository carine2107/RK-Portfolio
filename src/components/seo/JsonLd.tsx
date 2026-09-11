import type { Locale } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'
import { siteUrl } from '@/lib/env'
import type { BookView, InsightView, SiteSettingsView } from '@/lib/types'

type Json = Record<string, unknown>

/** Renders a Schema.org graph. Inline JSON only — no external script. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  const payload = Array.isArray(data) ? data : [data]
  return (
    <script
      type="application/ld+json"
      // The payload is built server-side from typed content, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, '\\u003c') }}
    />
  )
}

export function personSchema(settings: SiteSettingsView, locale: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: settings.name,
    jobTitle: settings.headline,
    url: absoluteUrl(locale, ''),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.social.length > 0 ? { sameAs: settings.social.map((item) => item.url) } : {}),
    ...(settings.logo?.url ? { image: `${siteUrl}${settings.logo.url}` } : {}),
    knowsLanguage: ['fr', 'en', 'de'],
  }
}

export function websiteSchema(settings: SiteSettingsView, locale: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: settings.name,
    url: absoluteUrl(locale, ''),
    inLanguage: locale,
    publisher: { '@id': `${siteUrl}/#person` },
  }
}

export function organizationSchema(
  name: string,
  description: string,
  url: string | undefined,
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    ...(url ? { url } : {}),
    founder: { '@id': `${siteUrl}/#person` },
  }
}

export function articleSchema(article: InsightView, locale: Locale, authorName: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    inLanguage: locale,
    datePublished: article.publishedAt ?? undefined,
    author: { '@type': 'Person', name: article.author || authorName },
    publisher: { '@id': `${siteUrl}/#person` },
    mainEntityOfPage: absoluteUrl(locale, `/insights/${article.slug}`),
    ...(article.cover?.url ? { image: [`${siteUrl}${article.cover.url}`] } : {}),
    ...(article.category ? { articleSection: article.category.title } : {}),
  }
}

export function bookSchema(book: BookView, locale: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    ...(book.subtitle ? { alternativeHeadline: book.subtitle } : {}),
    description: book.summary,
    author: { '@type': 'Person', name: book.author },
    inLanguage: book.languages.length > 0 ? book.languages : locale,
    ...(book.isbn ? { isbn: book.isbn } : {}),
    url: absoluteUrl(locale, `/books/${book.slug}`),
    ...(book.cover?.url ? { image: `${siteUrl}${book.cover.url}` } : {}),
    ...(book.price !== null && book.saleType === 'external'
      ? {
          offers: {
            '@type': 'Offer',
            price: book.price,
            priceCurrency: book.currency,
            availability:
              book.availability === 'available'
                ? 'https://schema.org/InStock'
                : book.availability === 'preorder'
                  ? 'https://schema.org/PreOrder'
                  : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
  }
}

export function breadcrumbSchema(items: { label: string; path: string }[], locale: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(locale, item.path),
    })),
  }
}
