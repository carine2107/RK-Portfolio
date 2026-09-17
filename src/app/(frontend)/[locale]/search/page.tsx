import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { highlightParts, MIN_QUERY_LENGTH, normalizeQuery, searchTerms } from '@/lib/search'
import { searchSite } from '@/lib/search-cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Rendered on every request: results depend on `?q=`. Without this, the page was
 * prerendered once (the locale layout lists its params) and every visit failed
 * with DYNAMIC_SERVER_USAGE in the production image.
 */
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'search.meta' })
  // Result pages are not indexed: their content already has its own pages.
  return pageMetadata({
    locale,
    path: '/search',
    title: t('title'),
    description: t('description'),
    noindex: true,
  })
}

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightParts(text, terms).map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded-sm bg-surface-accent px-0.5 text-primary">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('search')
  const nav = await getTranslations('nav')
  const raw = (await searchParams).q
  const typed = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''
  const query = normalizeQuery(raw)
  const terms = searchTerms(query)
  const groups = query ? await searchSite(query, locale) : []
  const total = groups.reduce((sum, group) => sum + group.results.length, 0)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: t('title'), path: '/search' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: t('title') }]}
      />

      <Section>
        <form role="search" action={`/${locale}/search`} method="get" className="max-w-2xl">
          <label htmlFor="search-query" className="block text-sm font-medium text-primary">
            {t('label')}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="search-query"
              name="q"
              type="search"
              defaultValue={typed}
              placeholder={t('placeholder')}
              minLength={MIN_QUERY_LENGTH}
              maxLength={100}
              autoComplete="off"
              className="w-full min-w-0 flex-1 rounded-card border border-line-strong bg-surface px-4 py-3 text-base text-primary placeholder:text-secondary"
            />
            <button type="submit" className={buttonClasses('primary', 'md', 'shrink-0')}>
              <Icon name="search" className="size-4" />
              {t('submit')}
            </button>
          </div>
        </form>

        <div className="mt-10" aria-live="polite">
          {!typed ? null : !query ? (
            <p className="text-secondary">{t('tooShort', { min: MIN_QUERY_LENGTH })}</p>
          ) : total === 0 ? (
            <p className="text-secondary">{t('empty', { query })}</p>
          ) : (
            <>
              <p className="text-secondary">{t('count', { count: total, query })}</p>
              <div className="mt-8 space-y-10">
                {groups.map((group) => (
                  <section key={group.group} aria-labelledby={`search-${group.group}`}>
                    <h2 id={`search-${group.group}`} className="rk-rule mb-5 text-xl text-primary">
                      {t(`groups.${group.group}`)}
                    </h2>
                    <ul className="divide-y divide-line border-y border-line">
                      {group.results.map((result) => (
                        <li key={result.id}>
                          <Link
                            href={result.href}
                            className="group block py-4 focus-visible:outline-offset-4"
                          >
                            <span className="font-serif text-lg text-primary group-hover:text-accent-text group-hover:underline">
                              <Highlighted text={result.title} terms={terms} />
                            </span>
                            {result.excerpt ? (
                              <span className="mt-1 block text-sm leading-relaxed text-secondary">
                                <Highlighted text={result.excerpt} terms={terms} />
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
