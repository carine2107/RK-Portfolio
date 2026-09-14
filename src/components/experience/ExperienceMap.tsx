'use client'

import { useTranslations } from 'next-intl'

import type { MapShape } from '@/lib/world-map'

/**
 * Europe–Africa map of the countries where assignments took place.
 *
 * The drawing is visual only (hidden from assistive technologies): the list of
 * country buttons next to it carries the same information and is the
 * keyboard-accessible control. Selected state is shown by colour AND by the
 * pressed button and the result count, never by colour alone.
 */
export function ExperienceMap({
  width,
  height,
  shapes,
  counts,
  names,
  selected,
  onSelect,
}: {
  width: number
  height: number
  shapes: MapShape[]
  /** Number of entries per country code (only countries with entries). */
  counts: Record<string, number>
  names: Record<string, string>
  selected: string
  onSelect: (code: string) => void
}) {
  const t = useTranslations('experience.map')
  const codes = Object.keys(counts).sort((a, b) => (names[a] ?? a).localeCompare(names[b] ?? b))

  return (
    <div className="grid gap-8 rounded-card border border-line bg-surface-subtle p-5 md:p-6 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full max-w-sm"
          aria-hidden="true"
          focusable="false"
        >
          {shapes.map((shape, index) => {
            const active = shape.code !== null && counts[shape.code] !== undefined
            const isSelected = active && shape.code === selected
            return (
              <path
                key={shape.code ?? `shape-${index}`}
                d={shape.d}
                onClick={active && shape.code ? () => onSelect(shape.code as string) : undefined}
                className={[
                  'stroke-[var(--surface-subtle)] stroke-[0.6] transition-colors',
                  isSelected
                    ? 'fill-[var(--text-primary)]'
                    : active
                      ? 'cursor-pointer fill-accent hover:fill-[var(--accent-strong)]'
                      : 'fill-[var(--border-strong)]',
                ].join(' ')}
              >
                {active && shape.code ? <title>{names[shape.code]}</title> : null}
              </path>
            )
          })}
        </svg>
      </div>

      <div className="lg:col-span-7">
        <h2 className="font-serif text-2xl text-primary">{t('countriesTitle')}</h2>
        <p className="mt-2 text-sm text-secondary">{t('countriesDescription')}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={t('chipsLabel')}>
          {codes.map((code) => {
            const pressed = code === selected
            return (
              <li key={code}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onSelect(code)}
                  className={[
                    'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors',
                    pressed
                      ? 'border-transparent bg-surface-inverse text-inverse'
                      : 'border-line-strong bg-surface text-primary hover:border-line-accent',
                  ].join(' ')}
                >
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-accent" />
                  {names[code] ?? code}
                  <span className={pressed ? 'text-inverse-secondary' : 'text-secondary'}>
                    {t('count', { count: counts[code] ?? 0 })}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
