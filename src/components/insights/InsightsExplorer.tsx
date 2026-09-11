'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate, isoDate } from '@/lib/format'
import type { CategoryView, InsightView } from '@/lib/types'

const PAGE_SIZE = 9

export function InsightsExplorer({
  articles,
  categories,
  locale,
  featuredId,
}: {
  articles: InsightView[]
  categories: CategoryView[]
  locale: Locale
  /** Shown above the list; hidden from the grid only while no filter is active. */
  featuredId?: string
}) {
  const t = useTranslations('insights')
  const common = useTranslations('common')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtering = needle !== '' || category !== ''
    return articles.filter((article) => {
      if (!filtering && featuredId && article.id === featuredId) return false
      if (category && article.category?.slug !== category) return false
      if (!needle) return true
      return (
        article.title.toLowerCase().includes(needle) ||
        article.excerpt.toLowerCase().includes(needle) ||
        (article.category?.title.toLowerCase().includes(needle) ?? false)
      )
    })
  }, [articles, category, query, featuredId])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const usedCategories = categories.filter((cat) =>
    articles.some((article) => article.category?.slug === cat.slug),
  )

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-sm">
          <label
            htmlFor="insights-search"
            className="text-xs tracking-[0.12em] text-secondary uppercase"
          >
            {t('searchLabel')}
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-secondary">
              <Icon name="search" className="size-4" />
            </span>
            <input
              id="insights-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder={common('searchPlaceholder')}
              className="min-h-11 w-full rounded-full border border-line-strong bg-surface pr-4 pl-11 text-sm text-primary placeholder:text-secondary"
            />
          </div>
        </div>

        {usedCategories.length > 0 ? (
          <div>
            <p
              id="insights-categories"
              className="text-xs tracking-[0.12em] text-secondary uppercase"
            >
              {t('categories')}
            </p>
            <ul aria-labelledby="insights-categories" className="mt-2 flex flex-wrap gap-2">
              <li>
                <FilterChip
                  active={category === ''}
                  onClick={() => {
                    setCategory('')
                    setPage(1)
                  }}
                >
                  {common('all')}
                </FilterChip>
              </li>
              {usedCategories.map((cat) => (
                <li key={cat.id}>
                  <FilterChip
                    active={category === cat.slug}
                    onClick={() => {
                      setCategory(cat.slug)
                      setPage(1)
                    }}
                  >
                    {cat.title}
                  </FilterChip>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-secondary">
        {t('resultsAnnouncement', { count: filtered.length })}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line-strong bg-surface-subtle px-6 py-14 text-center">
          <p className="text-secondary">{t('empty')}</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <li key={article.id} className="flex">
              <ArticleCard article={article} locale={locale} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label={common('page', { current: currentPage, total: totalPages })}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-primary disabled:opacity-50"
          >
            {common('previous')}
          </button>
          <span className="text-sm text-secondary">
            {common('page', { current: currentPage, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-primary disabled:opacity-50"
          >
            {common('next')}
          </button>
        </nav>
      ) : null}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'min-h-11 rounded-full border px-4 text-sm transition-colors',
        active
          ? 'border-line-accent bg-surface-accent text-accent-text'
          : 'border-line-strong text-secondary hover:border-line-accent hover:text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ArticleCard({ article, locale }: { article: InsightView; locale: Locale }) {
  const common = useTranslations('common')

  return (
    <article className="group relative flex h-full flex-col rounded-card border border-line bg-surface-raised p-6 shadow-card transition-[border-color,box-shadow] hover:border-line-accent hover:shadow-raised">
      {article.cover ? (
        <div className="mb-5 overflow-hidden rounded-card bg-surface-subtle">
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            width={article.cover.width ?? 1600}
            height={article.cover.height ?? 900}
            sizes="(min-width: 1024px) 22rem, (min-width: 768px) 45vw, 100vw"
            className="aspect-16/9 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-secondary uppercase">
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
      </div>

      <h3 className="mt-3 text-xl leading-snug text-primary">
        <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-secondary">{article.excerpt}</p>

      <p className="mt-5 flex items-center gap-2 text-sm text-accent-text">
        {common('minuteRead', { minutes: article.readingTime })}
        <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
      </p>
    </article>
  )
}
