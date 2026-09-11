'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatPeriod } from '@/lib/format'
import type { ExperienceView } from '@/lib/types'

type Filters = {
  expertise: string
  sector: string
  organisation: string
  region: string
  type: string
}

const EMPTY: Filters = { expertise: '', sector: '', organisation: '', region: '', type: '' }

export function ExperienceExplorer({
  experiences,
  expertiseOptions,
  locale,
}: {
  experiences: ExperienceView[]
  expertiseOptions: { slug: string; title: string }[]
  locale: Locale
}) {
  const t = useTranslations('experience')
  const common = useTranslations('common')

  // Filtering happens in the browser on data already rendered by the server:
  // the full list is in the HTML, which keeps it indexable.
  const [filters, setFilters] = useState<Filters>(EMPTY)

  const sectors = useMemo(
    () => unique(experiences.map((entry) => entry.sector).filter(Boolean)),
    [experiences],
  )
  const organisations = useMemo(
    () => unique(experiences.map((entry) => entry.organisation).filter(Boolean)),
    [experiences],
  )

  const filtered = useMemo(
    () =>
      experiences.filter((entry) => {
        if (filters.type && entry.type !== filters.type) return false
        if (filters.region && entry.region !== filters.region) return false
        if (filters.sector && entry.sector !== filters.sector) return false
        if (filters.organisation && entry.organisation !== filters.organisation) return false
        if (filters.expertise && !entry.expertiseSlugs.includes(filters.expertise)) return false
        return true
      }),
    [experiences, filters],
  )

  const hasFilters = Object.values(filters).some((value) => value !== '')

  const update = (key: keyof Filters) => (event: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }))

  return (
    <div>
      <div className="rounded-card border border-line bg-surface-subtle p-5">
        <div className="flex flex-wrap items-end gap-4">
          <Field
            label={t('filters.expertise')}
            value={filters.expertise}
            onChange={update('expertise')}
          >
            <option value="">{common('all')}</option>
            {expertiseOptions.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.title}
              </option>
            ))}
          </Field>

          <Field label={t('filters.type')} value={filters.type} onChange={update('type')}>
            <option value="">{common('all')}</option>
            <option value="assignment">{t('types.assignment')}</option>
            <option value="project">{t('types.project')}</option>
          </Field>

          <Field label={t('filters.region')} value={filters.region} onChange={update('region')}>
            <option value="">{common('all')}</option>
            <option value="europe">{common('regions.europe')}</option>
            <option value="africa">{common('regions.africa')}</option>
            <option value="international">{common('regions.international')}</option>
          </Field>

          {sectors.length > 0 ? (
            <Field label={t('filters.sector')} value={filters.sector} onChange={update('sector')}>
              <option value="">{common('all')}</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </Field>
          ) : null}

          {organisations.length > 0 ? (
            <Field
              label={t('filters.organisation')}
              value={filters.organisation}
              onChange={update('organisation')}
            >
              <option value="">{common('all')}</option>
              {organisations.map((organisation) => (
                <option key={organisation} value={organisation}>
                  {organisation}
                </option>
              ))}
            </Field>
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
        {common('results', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line-strong bg-surface-subtle px-6 py-14 text-center">
          <p className="text-secondary">{t('empty')}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <ExperienceRow entry={entry} locale={locale} ongoingLabel={t('card.ongoing')} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  const id = `filter-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex min-w-40 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs tracking-[0.12em] text-secondary uppercase">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-primary"
      >
        {children}
      </select>
    </div>
  )
}

function ExperienceRow({
  entry,
  locale,
  ongoingLabel,
}: {
  entry: ExperienceView
  locale: Locale
  ongoingLabel: string
}) {
  const common = useTranslations('common')
  const period = formatPeriod(entry.startDate, entry.endDate, locale, ongoingLabel)

  return (
    <article className="group relative rounded-card border border-line bg-surface-raised p-6 transition-[border-color,box-shadow] hover:border-line-accent hover:shadow-raised">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-secondary uppercase">
        <span className="text-accent-text">{common(`regions.${entry.region}`)}</span>
        {period ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{period}</span>
          </>
        ) : null}
        {entry.sector ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{entry.sector}</span>
          </>
        ) : null}
      </div>

      <h3 className="mt-3 text-xl text-primary">
        <Link href={`/experience/${entry.slug}`} className="after:absolute after:inset-0">
          {entry.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-sm font-medium text-primary">{entry.organisation}</p>
      <p className="text-sm text-secondary">{entry.role}</p>
      <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-secondary">
        {entry.summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-text">
          {common('readMore')}
          <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
        {entry.isPlaceholder ? (
          <span className="inline-flex items-center rounded-full border border-warning-line bg-warning-surface px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-warning-text uppercase">
            {common('placeholderBadge')}
          </span>
        ) : null}
      </div>
    </article>
  )
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
