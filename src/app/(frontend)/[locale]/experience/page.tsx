import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ExperienceExplorer } from '@/components/experience/ExperienceExplorer'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getExperiences, getExpertiseAreas, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'
import { getEuropeAfricaMap } from '@/lib/world-map'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'experience.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/experience',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function ExperiencePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('experience')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')
  const [experiences, expertise] = await Promise.all([
    getExperiences(locale),
    getExpertiseAreas(locale),
  ])

  const usedExpertise = expertise
    .filter((area) => experiences.some((entry) => entry.expertiseSlugs.includes(area.slug)))
    .map((area) => ({ slug: area.slug, title: area.title }))

  const regions = ['europe', 'africa', 'international'] as const
  const regionCounts = regions.map((region) => ({
    region,
    count: experiences.filter((entry) => entry.region === region).length,
  }))

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('experience'), path: '/experience' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('experience') }]}
      >
        {experiences.length > 0 ? (
          <div>
            <h2 className="sr-only">{t('map.title')}</h2>
            <ul className="flex flex-wrap gap-3">
              {regionCounts
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <li
                    key={entry.region}
                    className="rounded-full border border-line-accent bg-surface px-4 py-2 text-sm text-primary"
                  >
                    {common(`regions.${entry.region}`)}
                    <span className="ml-2 text-secondary">{entry.count}</span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </PageHeader>

      <Section>
        {experiences.length === 0 ? (
          <EmptyState message={t('emptyAll')} />
        ) : (
          <ExperienceExplorer
            experiences={experiences}
            expertiseOptions={usedExpertise}
            locale={locale}
            map={getEuropeAfricaMap()}
          />
        )}
      </Section>
    </>
  )
}
