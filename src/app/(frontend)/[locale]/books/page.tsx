import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BookCard } from '@/components/cards/ContentCards'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getBooks, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'books.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/books',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function BooksPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('books')
  const nav = await getTranslations('nav')
  const books = await getBooks(locale)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('books'), path: '/books' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('books') }]}
      />

      <Section>
        {books.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <ul className={books.length === 1 ? 'grid max-w-3xl gap-6' : 'grid gap-6 lg:grid-cols-2'}>
            {books.map((book) => (
              <li key={book.id} className="flex">
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
