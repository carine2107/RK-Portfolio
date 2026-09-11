import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ExperienceCard, InsightCard } from '@/components/cards/ContentCards'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { CtaLink } from '@/components/ui/CtaLink'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { PlaceholderNotice } from '@/components/ui/Notices'
import { RichText, richTextToPlainText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import { getExperiences, getExpertiseAreas, getExpertiseBySlug, getInsights } from '@/lib/cms'
import { metaDescription, pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const area = await getExpertiseBySlug(locale, slug)
  if (!area) return {}

  const paths = await entryPaths(getExpertiseAreas, area.id, '/expertise')

  return pageMetadata({
    locale,
    path: `/expertise/${area.slug}`,
    paths,
    title: area.seo.title ?? area.title,
    description:
      area.seo.description ?? metaDescription(area.summary || richTextToPlainText(area.intro)),
    image: area.seo.image,
    noindex: area.seo.noindex,
  })
}

export default async function ExpertiseDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const area = await getExpertiseBySlug(locale, slug)
  if (!area) notFound()

  const t = await getTranslations('expertise')
  const nav = await getTranslations('nav')
  const [experiences, insights] = await Promise.all([getExperiences(locale), getInsights(locale)])

  const relatedExperiences = experiences
    .filter((entry) => entry.expertiseSlugs.includes(area.slug))
    .slice(0, 3)
  const relatedInsights = insights
    .filter((entry) => entry.relatedExpertiseSlugs.includes(area.slug))
    .slice(0, 3)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('expertise'), path: '/expertise' },
            { label: area.title, path: `/expertise/${area.slug}` },
          ],
          locale,
        )}
      />

      <PageHeader
        eyebrow={nav('expertise')}
        title={area.title}
        lead={area.summary}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: nav('expertise'), href: '/expertise' },
          { label: area.title },
        ]}
      />

      <Section>
        {area.isPlaceholder ? <PlaceholderNotice className="mb-10" /> : null}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <RichText content={area.intro} />

            {area.challenges.length > 0 ? (
              <section aria-labelledby="expertise-challenges" className="mt-12">
                <h2 id="expertise-challenges" className="rk-rule text-2xl">
                  {t('sections.challenges')}
                </h2>
                <ul className="mt-5 space-y-3">
                  {area.challenges.map((item) => (
                    <li key={item} className="flex gap-3 text-secondary">
                      <Icon name="arrow" className="mt-1 size-4 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {area.services.length > 0 ? (
              <section aria-labelledby="expertise-services" className="mt-12">
                <h2 id="expertise-services" className="rk-rule text-2xl">
                  {t('sections.services')}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {area.services.map((service) => (
                    <li
                      key={service.title}
                      className="rounded-card border border-line bg-surface-raised p-5"
                    >
                      <h3 className="text-base font-semibold text-primary">{service.title}</h3>
                      {service.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-secondary">
                          {service.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {area.approach ? (
              <section aria-labelledby="expertise-approach" className="mt-12">
                <h2 id="expertise-approach" className="rk-rule text-2xl">
                  {t('sections.approach')}
                </h2>
                <RichText content={area.approach} className="mt-5" />
              </section>
            ) : null}
          </div>

          <aside className="lg:col-span-5">
            {area.audiences.length > 0 ? (
              <section
                aria-labelledby="expertise-audiences"
                className="rounded-card border border-line bg-surface-subtle p-6"
              >
                <h2
                  id="expertise-audiences"
                  className="text-sm tracking-[0.14em] text-secondary uppercase"
                >
                  {t('sections.audiences')}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {area.audiences.map((audience) => (
                    <li key={audience} className="flex items-start gap-3 text-primary">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {audience}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-8 rounded-card border border-line-accent bg-surface-accent p-6">
              <h2 className="font-serif text-xl text-primary">{t('cta.title')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{t('cta.body')}</p>
              <CtaLink
                href="/contact"
                event="work_with_me_click"
                location={`expertise_${area.slug}`}
                variant="primary"
                className="mt-5"
              >
                {t('cta.button')}
                <Icon name="arrow" className="size-4" />
              </CtaLink>
            </div>
          </aside>
        </div>
      </Section>

      {relatedExperiences.length > 0 ? (
        <Section tone="subtle" labelledBy="expertise-related-experience">
          <h2 id="expertise-related-experience" className="rk-rule mb-8 text-2xl">
            {t('sections.experience')}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {relatedExperiences.map((experience) => (
              <li key={experience.id} className="flex">
                <ExperienceCard experience={experience} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {relatedInsights.length > 0 ? (
        <Section labelledBy="expertise-related-insights">
          <h2 id="expertise-related-insights" className="rk-rule mb-8 text-2xl">
            {t('sections.insights')}
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
