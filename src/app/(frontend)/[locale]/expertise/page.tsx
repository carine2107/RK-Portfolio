import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ExpertiseCard } from '@/components/cards/ContentCards'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { CtaLink } from '@/components/ui/CtaLink'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getExpertiseAreas, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'expertise.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/expertise',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function ExpertisePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('expertise')
  const nav = await getTranslations('nav')
  const areas = await getExpertiseAreas(locale)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('expertise'), path: '/expertise' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('expertise') }]}
      />

      <Section>
        {areas.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area.id} className="flex">
                <ExpertiseCard area={area} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="contrast" labelledBy="expertise-cta">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="expertise-cta" className="font-serif text-2xl text-on-contrast md:text-3xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-on-contrast-secondary">{t('cta.body')}</p>
          <div className="mt-8 flex justify-center">
            <CtaLink
              href="/contact"
              event="work_with_me_click"
              location="expertise_index"
              variant="accent"
              size="lg"
            >
              {t('cta.button')}
              <Icon name="arrow" className="size-4" />
            </CtaLink>
          </div>
        </div>
      </Section>
    </>
  )
}
