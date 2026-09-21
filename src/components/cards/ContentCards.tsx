import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Card, CardBody, CardLink, CardMeta, CardTitle } from '@/components/ui/Card'
import { Icon, type IconName } from '@/components/ui/Icon'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { PlaceholderBadge } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate, formatPeriod, isoDate } from '@/lib/format'
import type {
  BookView,
  BusinessView,
  ExperienceView,
  ExpertiseView,
  InsightView,
} from '@/lib/types'

const EXPERTISE_ICONS: Record<string, IconName> = {
  chart: 'chart',
  magnifier: 'magnifier',
  growth: 'growth',
  plan: 'plan',
  spark: 'spark',
  coins: 'coins',
  building: 'building',
  people: 'people',
}

export function ExpertiseCard({
  area,
  headingLevel = 'h3',
}: {
  area: ExpertiseView
  /** h2 when the card sits directly under the page title (expertise list). */
  headingLevel?: 'h2' | 'h3'
}) {
  return (
    <Card className="justify-between">
      <div>
        <span className="mb-5 inline-flex size-11 items-center justify-center rounded-full border border-line-accent text-accent-text transition-colors group-hover:bg-surface-accent">
          <Icon name={EXPERTISE_ICONS[area.icon] ?? 'chart'} className="size-5" />
        </span>
        <CardTitle as={headingLevel}>
          <CardLink href={`/expertise/${area.slug}`}>{area.title}</CardLink>
        </CardTitle>
        <CardBody>{area.summary}</CardBody>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-text">
        <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Card>
  )
}

export async function ExperienceCard({
  experience,
  locale,
}: {
  experience: ExperienceView
  locale: Locale
}) {
  const t = await getTranslations('experience')
  const common = await getTranslations('common')
  const period = formatPeriod(experience.startDate, experience.endDate, locale, t('card.ongoing'))

  return (
    <Card>
      <CardMeta>
        <span className="text-accent-text">{common(`regions.${experience.region}`)}</span>
        {period ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{period}</span>
          </>
        ) : null}
      </CardMeta>
      <div className="mt-4">
        <CardTitle>
          <CardLink href={`/experience/${experience.slug}`}>{experience.title}</CardLink>
        </CardTitle>
        <p className="mt-2 text-sm font-medium text-primary">{experience.organisation}</p>
        <p className="text-sm text-secondary">{experience.role}</p>
        <CardBody>{experience.summary}</CardBody>
      </div>
      {experience.isPlaceholder ? (
        <div className="mt-5">
          <PlaceholderBadge />
        </div>
      ) : null}
    </Card>
  )
}

export async function InsightCard({
  article,
  locale,
  featured = false,
}: {
  article: InsightView
  locale: Locale
  featured?: boolean
}) {
  const t = await getTranslations('common')

  return (
    <Card className={featured ? 'md:flex-row md:items-stretch md:gap-8' : ''}>
      {article.cover ? (
        <div
          className={[
            'relative mb-5 overflow-hidden rounded-card bg-surface-subtle',
            featured ? 'md:mb-0 md:w-1/2 md:shrink-0' : '',
          ].join(' ')}
        >
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            width={article.cover.width ?? 1600}
            height={article.cover.height ?? 900}
            sizes={featured ? '(min-width: 768px) 32rem, 100vw' : '(min-width: 768px) 24rem, 100vw'}
            className="aspect-16/9 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        <CardMeta>
          {article.category ? (
            <span className="text-accent-text">{article.category.title}</span>
          ) : null}
          {article.publishedAt ? (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={isoDate(article.publishedAt)}>
                {formatDate(article.publishedAt, locale)}
              </time>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{t('minuteRead', { minutes: article.readingTime })}</span>
        </CardMeta>

        <div className="mt-4 flex-1">
          <CardTitle as={featured ? 'h2' : 'h3'}>
            <CardLink href={`/insights/${article.slug}`}>{article.title}</CardLink>
          </CardTitle>
          <CardBody>{article.excerpt}</CardBody>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {article.isPlaceholder ? <PlaceholderBadge /> : null}
          <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-text">
            {t('readArticle')}
            <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Card>
  )
}

/**
 * Language of a book title when it differs from the page (a French book on the
 * German site): declared with `lang` so screen readers pronounce it correctly.
 */
export function bookTitleLang(book: BookView, locale: string): string | undefined {
  const [only] = book.languages
  return book.languages.length === 1 && only && only !== locale ? only : undefined
}

export async function BookCard({
  book,
  headingLevel = 'h3',
}: {
  book: BookView
  /** h2 when the card sits directly under the page title (books list). */
  headingLevel?: 'h2' | 'h3'
}) {
  const t = await getTranslations('books')
  const locale = await getLocale()
  const titleLang = bookTitleLang(book, locale)

  return (
    <Card className="sm:flex-row sm:gap-6">
      <div className="mb-5 w-32 shrink-0 sm:mb-0 sm:w-36">
        {/* 2:3 is the 6 × 9 in trade format: a cover is never cropped. */}
        <div className="relative aspect-2/3 overflow-hidden rounded-sm border border-line bg-surface-subtle shadow-raised">
          {book.cover ? (
            <Image
              src={book.cover.url}
              alt={book.cover.alt}
              fill
              sizes="(min-width: 640px) 9rem, 8rem"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center font-serif text-xs text-secondary">
              RK
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <CardTitle as={headingLevel}>
          <CardLink href={`/books/${book.slug}`}>
            <span lang={titleLang}>{book.title}</span>
          </CardLink>
        </CardTitle>
        {book.subtitle ? (
          <p lang={titleLang} className="mt-1 text-sm text-secondary">
            {book.subtitle}
          </p>
        ) : null}
        <CardBody>{book.summary}</CardBody>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-line px-3 py-1 text-xs tracking-wide text-secondary uppercase">
            {t(`availability.${book.availability}`)}
          </span>
          {book.isPlaceholder ? <PlaceholderBadge /> : null}
        </div>
      </div>
    </Card>
  )
}

export async function BusinessCard({
  business,
  headingLevel = 'h3',
}: {
  business: BusinessView
  /** h2 when the card sits directly under the page title (businesses list). */
  headingLevel?: 'h2' | 'h3'
}) {
  const t = await getTranslations('businesses')

  return (
    <Card tone="outline" className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <CardTitle as={headingLevel}>{business.name}</CardTitle>
          {business.tagline ? (
            <p className="mt-1 text-sm text-accent-text">{business.tagline}</p>
          ) : null}
        </div>
        {business.logo || business.isPlaceholder ? (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {business.logo ? (
              // `mix-blend-multiply` drops the white background most logo files
              // carry, so files with and without transparency look the same. The
              // light plate comes back in the dark theme, where logos drawn for a
              // white background would otherwise disappear.
              <div className="flex h-16 items-center dark:rounded-card dark:bg-white dark:px-3 dark:py-1.5 dark:ring-1 dark:ring-black/5">
                {/* Decorative: the company name is right next to it. */}
                <Image
                  src={business.logo.url}
                  alt=""
                  width={business.logo.width ?? 320}
                  height={business.logo.height ?? 160}
                  sizes="10rem"
                  className="h-full w-auto max-w-40 object-contain mix-blend-multiply"
                />
              </div>
            ) : null}
            {business.isPlaceholder ? <PlaceholderBadge /> : null}
          </div>
        ) : null}
      </div>
      <CardBody>{business.description}</CardBody>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {business.field ? (
          <div>
            <dt className="text-xs tracking-wide text-secondary uppercase">{t('fields.field')}</dt>
            <dd className="mt-0.5 text-primary">{business.field}</dd>
          </div>
        ) : null}
        {business.audience ? (
          <div>
            <dt className="text-xs tracking-wide text-secondary uppercase">
              {t('fields.audience')}
            </dt>
            <dd className="mt-0.5 text-primary">{business.audience}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {business.website ? (
          <ExternalLink
            href={business.website}
            event="business_click"
            payload={{ business: business.slug }}
            className="inline-flex items-center gap-2 font-medium text-accent-text underline-offset-4 hover:underline"
          >
            {t('fields.website')}
            <Icon name="external" className="size-4" />
          </ExternalLink>
        ) : null}
        {/* The company's own contact page, then its e-mail, then this site's contact page. */}
        {business.contactUrl ? (
          <ExternalLink
            href={business.contactUrl}
            event="business_click"
            payload={{ business: business.slug, link: 'contact' }}
            className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('cta')}
            <Icon name="external" className="size-4" />
          </ExternalLink>
        ) : business.contactEmail ? (
          <a
            href={`mailto:${business.contactEmail}`}
            className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('cta')}
            <Icon name="arrow" className="size-4" />
          </a>
        ) : (
          <Link
            href={{ pathname: '/contact', query: { business: business.slug } }}
            className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('cta')}
            <Icon name="arrow" className="size-4" />
          </Link>
        )}
      </div>
    </Card>
  )
}
