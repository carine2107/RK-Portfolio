import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { InsightCard } from '@/components/cards/ContentCards'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { CtaLink } from '@/components/ui/CtaLink'
import { Icon } from '@/components/ui/Icon'
import { Notice, PlaceholderNotice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import { getExperienceBySlug, getExperiences, getExpertiseAreas, getInsights } from '@/lib/cms'
import { formatPeriod } from '@/lib/format'
import { metaDescription, pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const entry = await getExperienceBySlug(locale, slug)
  if (!entry) return {}

  const paths = await entryPaths(getExperiences, entry.id, '/experience')

  return pageMetadata({
    locale,
    path: `/experience/${entry.slug}`,
    paths,
    title: entry.seo.title ?? `${entry.title} — ${entry.organisation}`,
    description: entry.seo.description ?? metaDescription(entry.summary),
    image: entry.seo.image,
    noindex: entry.seo.noindex,
  })
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const entry = await getExperienceBySlug(locale, slug)
  if (!entry) notFound()

  const t = await getTranslations('experience')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')
  const [expertise, insights] = await Promise.all([getExpertiseAreas(locale), getInsights(locale)])

  const relatedExpertise = expertise.filter((area) => entry.expertiseSlugs.includes(area.slug))
  const relatedInsights = insights
    .filter((article) =>
      article.relatedExpertiseSlugs.some((s) => entry.expertiseSlugs.includes(s)),
    )
    .slice(0, 3)
  const period = formatPeriod(entry.startDate, entry.endDate, locale, t('card.ongoing'))

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('experience'), path: '/experience' },
            { label: entry.title, path: `/experience/${entry.slug}` },
          ],
          locale,
        )}
      />

      <PageHeader
        eyebrow={common(`regions.${entry.region}`)}
        title={entry.title}
        lead={entry.summary}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: nav('experience'), href: '/experience' },
          { label: entry.title },
        ]}
      />

      <Section>
        {entry.isPlaceholder ? <PlaceholderNotice className="mb-10" /> : null}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {entry.context ? (
              <section aria-labelledby="experience-context">
                <h2 id="experience-context" className="rk-rule text-2xl">
                  {t('detail.context')}
                </h2>
                <RichText content={entry.context} className="mt-5" />
              </section>
            ) : null}

            {entry.responsibilities.length > 0 ? (
              <section aria-labelledby="experience-responsibilities" className="mt-12">
                <h2 id="experience-responsibilities" className="rk-rule text-2xl">
                  {t('detail.responsibilities')}
                </h2>
                <ul className="mt-5 space-y-3">
                  {entry.responsibilities.map((item) => (
                    <li key={item} className="flex gap-3 text-secondary">
                      <Icon name="arrow" className="mt-1 size-4 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="experience-results" className="mt-12">
              <h2 id="experience-results" className="rk-rule text-2xl">
                {t('detail.results')}
              </h2>
              {entry.results.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {entry.results.map((item) => (
                    <li key={item} className="flex gap-3 text-secondary">
                      <Icon name="arrow" className="mt-1 size-4 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Notice tone="info" className="mt-5">
                  {t('detail.resultsPending')}
                </Notice>
              )}
            </section>
          </div>

          <aside className="lg:col-span-5">
            <dl className="rounded-card border border-line bg-surface-subtle p-6 text-sm">
              <div className="border-b border-line pb-4">
                <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                  {t('filters.organisation')}
                </dt>
                <dd className="mt-1 text-base text-primary">{entry.organisation}</dd>
              </div>
              <div className="border-b border-line py-4">
                <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                  {t('card.role')}
                </dt>
                <dd className="mt-1 text-base text-primary">{entry.role}</dd>
              </div>
              {period ? (
                <div className="border-b border-line py-4">
                  <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                    {t('card.period')}
                  </dt>
                  <dd className="mt-1 text-base text-primary">{period}</dd>
                </div>
              ) : null}
              {entry.sector ? (
                <div className="border-b border-line py-4">
                  <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                    {t('filters.sector')}
                  </dt>
                  <dd className="mt-1 text-base text-primary">{entry.sector}</dd>
                </div>
              ) : null}
              {entry.countries.length > 0 ? (
                <div className="pt-4">
                  <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                    {t('card.countries')}
                  </dt>
                  <dd className="mt-1 text-base text-primary">{entry.countries.join(', ')}</dd>
                </div>
              ) : null}
            </dl>

            {relatedExpertise.length > 0 ? (
              <section aria-labelledby="experience-expertise" className="mt-8">
                <h2
                  id="experience-expertise"
                  className="text-sm tracking-[0.14em] text-secondary uppercase"
                >
                  {common('relatedExpertise')}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {relatedExpertise.map((area) => (
                    <li key={area.id}>
                      <Link
                        href={`/expertise/${area.slug}`}
                        className="inline-flex rounded-full border border-line px-3 py-1.5 text-sm text-primary transition-colors hover:border-line-accent hover:text-accent-text"
                      >
                        {area.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-8">
              <CtaLink
                href="/contact"
                event="work_with_me_click"
                location={`experience_${entry.slug}`}
                variant="primary"
              >
                {nav('workWithMe')}
                <Icon name="arrow" className="size-4" />
              </CtaLink>
            </div>
          </aside>
        </div>
      </Section>

      {relatedInsights.length > 0 ? (
        <Section tone="subtle" labelledBy="experience-insights">
          <h2 id="experience-insights" className="rk-rule mb-8 text-2xl">
            {common('relatedArticles')}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {relatedInsights.map((article) => (
              <li key={article.id} className="flex">
                <InsightCard article={article} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
