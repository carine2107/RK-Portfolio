import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BookCard, bookTitleLang } from '@/components/cards/ContentCards'
import { PurchaseBlock } from '@/components/books/PurchaseBlock'
import { bookSchema, breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { PlaceholderNotice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import { getBookBySlug, getBooks, getShopStatus } from '@/lib/cms'
import { formatDate, formatPrice } from '@/lib/format'
import { metaDescription, pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale; slug: string }> }

const LANGUAGE_LABELS: Record<string, Record<Locale, string>> = {
  en: { en: 'English', fr: 'Anglais', de: 'Englisch' },
  fr: { en: 'French', fr: 'Français', de: 'Französisch' },
  de: { en: 'German', fr: 'Allemand', de: 'Deutsch' },
}

const FORMAT_LABELS: Record<string, Record<Locale, string>> = {
  paperback: { en: 'Paperback', fr: 'Broché', de: 'Taschenbuch' },
  hardcover: { en: 'Hardcover', fr: 'Relié', de: 'Gebunden' },
  ebook: { en: 'E-book', fr: 'E-book', de: 'E-Book' },
  audiobook: { en: 'Audiobook', fr: 'Livre audio', de: 'Hörbuch' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const book = await getBookBySlug(locale, slug)
  if (!book) return {}

  const paths = await entryPaths(getBooks, book.id, '/books')

  return pageMetadata({
    locale,
    path: `/books/${book.slug}`,
    paths,
    title: book.seo.title ?? book.title,
    description: book.seo.description ?? metaDescription(book.summary),
    image: book.seo.image ?? book.cover?.url,
    noindex: book.seo.noindex,
  })
}

export default async function BookDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const book = await getBookBySlug(locale, slug)
  if (!book) notFound()
  const shop = await getShopStatus()

  const t = await getTranslations('books')
  const nav = await getTranslations('nav')
  const allBooks = await getBooks(locale)

  const related = allBooks
    .filter(
      (entry) =>
        entry.id !== book.id &&
        (book.relatedBookSlugs.includes(entry.slug) || book.relatedBookSlugs.length === 0),
    )
    .slice(0, 2)

  const facts: { label: string; value: string }[] = [
    { label: t('details.author'), value: book.author },
    { label: t('details.publisher'), value: book.publisher },
    { label: t('details.publicationDate'), value: formatDate(book.publicationDate, locale) },
    { label: t('details.pages'), value: book.pages !== null ? String(book.pages) : '' },
    {
      label: t('details.language'),
      value: book.languages.map((code) => LANGUAGE_LABELS[code]?.[locale] ?? code).join(', '),
    },
    {
      label: t('details.format'),
      value: book.formats.map((code) => FORMAT_LABELS[code]?.[locale] ?? code).join(', '),
    },
    { label: t('details.isbn'), value: book.isbn },
    {
      label: t('details.price'),
      value: book.price !== null ? formatPrice(book.price, book.currency, locale) : '',
    },
    { label: t('details.availability'), value: t(`availability.${book.availability}`) },
  ].filter((fact) => fact.value !== '')

  return (
    <>
      <JsonLd
        data={[
          bookSchema(book, locale, shop.active),
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: nav('books'), path: '/books' },
              { label: book.title, path: `/books/${book.slug}` },
            ],
            locale,
          ),
        ]}
      />

      <PageHeader
        eyebrow={nav('books')}
        title={book.title}
        lead={book.subtitle}
        titleLang={bookTitleLang(book, locale)}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: nav('books'), href: '/books' },
          { label: book.title },
        ]}
      />

      <Section>
        {book.isPlaceholder ? <PlaceholderNotice className="mb-10" /> : null}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="relative mx-auto aspect-2/3 w-full max-w-xs overflow-hidden rounded-sm border border-line bg-surface-subtle shadow-float">
              {book.cover ? (
                <Image
                  src={book.cover.url}
                  alt={book.cover.alt || book.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 20rem, 80vw"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center font-serif text-4xl text-accent-text">
                  RK
                </span>
              )}
            </div>

            <div className="mt-8">
              <PurchaseBlock book={book} shopActive={shop.active} />
            </div>

            {book.previewUrl ? (
              <ExternalLink
                href={book.previewUrl}
                event="book_preview_click"
                payload={{ book: book.slug }}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:text-accent-text hover:underline"
              >
                <Icon name="download" className="size-4" />
                {t('details.preview')}
              </ExternalLink>
            ) : null}
          </div>

          <div className="lg:col-span-8">
            <h2 className="rk-rule text-2xl">{t('details.summary')}</h2>
            <p className="mt-5 text-base leading-relaxed text-secondary">{book.summary}</p>

            {book.description ? <RichText content={book.description} className="mt-8" /> : null}

            {book.audience.length > 0 ? (
              <section aria-labelledby="book-audience" className="mt-10">
                <h2 id="book-audience" className="rk-rule text-2xl">
                  {t('details.audience')}
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {book.audience.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-secondary">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {facts.length > 0 ? (
              <dl className="mt-10 grid gap-x-8 gap-y-4 border-t border-line pt-8 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-primary">{fact.value}</dd>
                  </div>
                ))}
                {book.price !== null ? (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-secondary">{t('details.priceNote')}</p>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section tone="subtle" labelledBy="book-related">
          <h2 id="book-related" className="rk-rule mb-8 text-2xl">
            {t('related')}
          </h2>
          <ul className="grid gap-6 lg:grid-cols-2">
            {related.map((entry) => (
              <li key={entry.id} className="flex">
                <BookCard book={entry} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
