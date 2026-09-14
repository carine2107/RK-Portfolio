import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, eventSchema, JsonLd } from '@/components/seo/JsonLd'
import { SpeakingExplorer } from '@/components/speaking/SpeakingExplorer'
import { CtaLink } from '@/components/ui/CtaLink'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getEngagements, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'speaking.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/speaking',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function SpeakingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('speaking')
  const nav = await getTranslations('nav')
  const engagements = await getEngagements(locale)
  const now = new Date().toISOString()

  const events = engagements
    .filter((entry) => (entry.endDate ?? entry.date) >= now)
    .map((entry) => eventSchema(entry, locale))
    .filter((schema) => schema !== null)

  return (
    <>
      <JsonLd
        data={[
          ...events,
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: nav('speaking'), path: '/speaking' },
            ],
            locale,
          ),
        ]}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('speaking') }]}
      />

      <Section>
        {engagements.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <SpeakingExplorer engagements={engagements} now={now} locale={locale} />
        )}
      </Section>

      <Section tone="contrast" labelledBy="speaking-invite">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="speaking-invite" className="font-serif text-2xl text-on-contrast md:text-3xl">
            {t('invite.title')}
          </h2>
          <p className="mt-4 text-on-contrast-secondary">{t('invite.body')}</p>
          <div className="mt-8 flex justify-center">
            <CtaLink
              href="/contact?type=speaking"
              event="work_with_me_click"
              location="speaking"
              variant="accent"
              size="lg"
            >
              {t('invite.cta')}
              <Icon name="arrow" className="size-4" />
            </CtaLink>
          </div>
        </div>
      </Section>
    </>
  )
}
