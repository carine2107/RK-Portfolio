'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate, isoDate } from '@/lib/format'
import type { EngagementView } from '@/lib/types'

/**
 * Upcoming and past engagements with a type filter. The full list is rendered
 * on the server (indexable); filtering happens in the browser.
 */
export function SpeakingExplorer({
  engagements,
  now,
  locale,
}: {
  engagements: EngagementView[]
  /** Reference time, from the server render, so both renders agree. */
  now: string
  locale: Locale
}) {
  const t = useTranslations('speaking')
  const [type, setType] = useState('')

  const types = useMemo(() => [...new Set(engagements.map((entry) => entry.type))], [engagements])
  const visible = engagements.filter((entry) => !type || entry.type === type)
  const upcoming = visible
    .filter((entry) => (entry.endDate ?? entry.date) >= now)
    .sort((a, b) => a.date.localeCompare(b.date))
  const past = visible
    .filter((entry) => (entry.endDate ?? entry.date) < now)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      {types.length > 1 ? (
        <ul className="flex flex-wrap gap-2" aria-label={t('filterLabel')}>
          {['', ...types].map((value) => (
            <li key={value || 'all'}>
              <button
                type="button"
                aria-pressed={type === value}
                onClick={() => setType(value)}
                className={[
                  'min-h-11 rounded-full border px-4 text-sm transition-colors',
                  type === value
                    ? 'border-transparent bg-surface-inverse text-inverse'
                    : 'border-line-strong bg-surface text-primary hover:border-line-accent',
                ].join(' ')}
              >
                {value ? t(`types.${value}`) : t('all')}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {visible.length === 0 ? t('emptyFiltered') : ''}
      </p>

      {upcoming.length > 0 ? (
        <section aria-labelledby="speaking-upcoming" className="mt-10">
          <h2 id="speaking-upcoming" className="rk-rule text-2xl">
            {t('upcoming')}
          </h2>
          <EngagementGrid entries={upcoming} locale={locale} />
        </section>
      ) : null}

      {past.length > 0 ? (
        <section aria-labelledby="speaking-past" className="mt-12">
          <h2 id="speaking-past" className="rk-rule text-2xl">
            {t('past')}
          </h2>
          <EngagementGrid entries={past} locale={locale} />
        </section>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-10 rounded-card border border-dashed border-line-strong bg-surface-subtle px-6 py-10 text-center text-secondary">
          {t('emptyFiltered')}
        </p>
      ) : null}
    </div>
  )
}

function EngagementGrid({ entries, locale }: { entries: EngagementView[]; locale: Locale }) {
  return (
    <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex">
          <EngagementCard entry={entry} locale={locale} />
        </li>
      ))}
    </ul>
  )
}

export function EngagementCard({ entry, locale }: { entry: EngagementView; locale: Locale }) {
  const t = useTranslations('speaking')
  const common = useTranslations('common')
  const place = [entry.city, entry.country].filter(Boolean).join(', ')

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface-raised transition-[border-color,box-shadow] hover:border-line-accent hover:shadow-raised">
      {entry.cover ? (
        <div className="relative aspect-16/9 bg-surface-sunken">
          <Image
            src={entry.cover.url}
            alt={entry.cover.alt}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          {entry.hasVideo ? (
            <span className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-accent text-on-accent">
              <Icon name="play" className="ml-0.5 size-4" />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent-text uppercase">
          {t(`types.${entry.type}`)}
          {entry.hasVideo && entry.type !== 'video' ? (
            <span className="ml-2 text-secondary">· {t('types.video')}</span>
          ) : null}
          {entry.durationMinutes ? (
            <span className="ml-2 text-secondary">
              · {t('minutes', { count: entry.durationMinutes })}
            </span>
          ) : null}
        </p>
        <h3 className="mt-3 text-xl leading-snug text-primary">
          <Link href={`/speaking/${entry.slug}`} className="after:absolute after:inset-0">
            {entry.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-secondary">{entry.summary}</p>
        <dl className="mt-5 space-y-1.5 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <dt>
              <Icon name="calendar" className="size-4" />
              <span className="sr-only">{t('detail.date')}</span>
            </dt>
            <dd>
              <time dateTime={isoDate(entry.date)}>{formatDate(entry.date, locale)}</time>
            </dd>
          </div>
          {entry.eventName || place ? (
            <div className="flex items-center gap-2">
              <dt>
                <Icon name="pin" className="size-4" />
                <span className="sr-only">{t('detail.location')}</span>
              </dt>
              <dd>{[entry.eventName, place].filter(Boolean).join(' · ')}</dd>
            </div>
          ) : null}
        </dl>
        {entry.isPlaceholder ? (
          <span className="mt-4 inline-flex w-fit items-center rounded-full border border-warning-line bg-warning-surface px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-warning-text uppercase">
            {common('placeholderBadge')}
          </span>
        ) : null}
      </div>
    </article>
  )
}
