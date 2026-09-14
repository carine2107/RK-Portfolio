'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { EngagementCard } from '@/components/speaking/SpeakingExplorer'
import type { Locale } from '@/i18n/routing'
import { filterMedia, MEDIA_FORMATS, mediaFormats, type MediaFilters } from '@/lib/media-library'
import type { EngagementView } from '@/lib/types'

const EMPTY: MediaFilters = { format: '', topic: '', language: '' }
const LANGUAGE_ORDER = ['fr', 'de', 'en']

/**
 * Videos, podcasts, interviews and press coverage with format, topic and
 * language filters. The full list is rendered on the server (indexable);
 * filtering happens in the browser.
 */
export function MediaLibrary({ entries, locale }: { entries: EngagementView[]; locale: Locale }) {
  const t = useTranslations('media')
  const common = useTranslations('common')
  const [filters, setFilters] = useState<MediaFilters>(EMPTY)

  const formats = useMemo(
    () => MEDIA_FORMATS.filter((format) => entries.some((e) => mediaFormats(e).includes(format))),
    [entries],
  )
  const topics = useMemo(() => {
    const bySlug = new Map<string, string>()
    entries.forEach((entry) => entry.topics.forEach((topic) => bySlug.set(topic.slug, topic.title)))
    return [...bySlug].sort((a, b) => a[1].localeCompare(b[1], locale))
  }, [entries, locale])
  const languages = useMemo(
    () => LANGUAGE_ORDER.filter((code) => entries.some((entry) => entry.languages.includes(code))),
    [entries],
  )

  const visible = filterMedia(entries, filters)
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div>
      <div className="rounded-card border border-line bg-surface-subtle p-5">
        {formats.length > 1 ? (
          <ul className="flex flex-wrap gap-2" aria-label={t('filters.format')}>
            {['', ...formats].map((value) => (
              <li key={value || 'all'}>
                <button
                  type="button"
                  aria-pressed={filters.format === value}
                  onClick={() => setFilters((current) => ({ ...current, format: value }))}
                  className={[
                    'min-h-11 rounded-full border px-4 text-sm transition-colors',
                    filters.format === value
                      ? 'border-transparent bg-surface-inverse text-inverse'
                      : 'border-line-strong bg-surface text-primary hover:border-line-accent',
                  ].join(' ')}
                >
                  {value ? t(`formats.${value}`) : common('all')}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={`flex flex-wrap items-end gap-4 ${formats.length > 1 ? 'mt-5' : ''}`}>
          {topics.length > 0 ? (
            <Select
              id="media-topic"
              label={t('filters.topic')}
              value={filters.topic}
              onChange={(topic) => setFilters((current) => ({ ...current, topic }))}
            >
              <option value="">{common('all')}</option>
              {topics.map(([slug, title]) => (
                <option key={slug} value={slug}>
                  {title}
                </option>
              ))}
            </Select>
          ) : null}

          {languages.length > 1 ? (
            <Select
              id="media-language"
              label={t('filters.language')}
              value={filters.language}
              onChange={(language) => setFilters((current) => ({ ...current, language }))}
            >
              <option value="">{common('all')}</option>
              {languages.map((code) => (
                <option key={code} value={code}>
                  {t(`languages.${code}`)}
                </option>
              ))}
            </Select>
          ) : null}

          {hasFilters ? (
            <button
              type="button"
              onClick={() => setFilters(EMPTY)}
              className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-primary transition-colors hover:border-line-accent hover:text-accent-text"
            >
              {common('clearFilters')}
            </button>
          ) : null}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-secondary">
        {common('results', { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-line-strong bg-surface-subtle px-6 py-10 text-center text-secondary">
          {t('emptyFiltered')}
        </p>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((entry) => (
            <li key={entry.id} className="flex">
              <EngagementCard entry={entry} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-48 flex-1 flex-col gap-1.5 sm:flex-none">
      <label htmlFor={id} className="text-xs tracking-[0.12em] text-secondary uppercase">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-primary"
      >
        {children}
      </select>
    </div>
  )
}
