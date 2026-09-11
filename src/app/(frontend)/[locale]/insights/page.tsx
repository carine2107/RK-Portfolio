import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { InsightCard } from '@/components/cards/ContentCards'
import { InsightsExplorer } from '@/components/insights/InsightsExplorer'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getCategories, getInsights, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'insights.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/insights',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('insights')
  const nav = await getTranslations('nav')
  const [articles, categories] = await Promise.all([getInsights(locale), getCategories(locale)])

  const featured = articles.find((article) => article.featured) ?? null

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('insights'), path: '/insights' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('insights') }]}
      />

      {articles.length === 0 ? (
        <Section>
          <EmptyState message={t('emptyAll')} />
        </Section>
      ) : (
        <>
          {featured ? (
            <Section labelledBy="insights-featured">
              <h2
                id="insights-featured"
                className="mb-6 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase"
              >
                {t('featured')}
              </h2>
              <InsightCard article={featured} locale={locale} featured />
            </Section>
          ) : null}

          <Section tone={featured ? 'subtle' : 'base'} labelledBy="insights-all">
            <h2
              id="insights-all"
              className="mb-6 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase"
            >
              {t('allArticles')}
            </h2>
            <InsightsExplorer
              articles={articles}
              categories={categories}
              locale={locale}
              featuredId={featured?.id}
            />
          </Section>
        </>
      )}
    </>
  )
}
