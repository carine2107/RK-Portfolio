import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BusinessCard } from '@/components/cards/ContentCards'
import { breadcrumbSchema, JsonLd, organizationSchema } from '@/components/seo/JsonLd'
import { CtaLink } from '@/components/ui/CtaLink'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getBusinesses, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'businesses.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/businesses',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function BusinessesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('businesses')
  const nav = await getTranslations('nav')
  const brand = await getTranslations('brand')
  const businesses = await getBusinesses(locale)

  return (
    <>
      <JsonLd
        data={[
          ...businesses.map((business) =>
            organizationSchema(business.name, business.description, business.website || undefined),
          ),
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: nav('businesses'), path: '/businesses' },
            ],
            locale,
          ),
        ]}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('businesses') }]}
      />

      <Section>
        {businesses.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <ul className="grid gap-6 lg:grid-cols-2 lg:[&>li:last-child:nth-child(odd)]:col-span-2">
            {businesses.map((business) => (
              <li key={business.id} className="flex">
                <BusinessCard business={business} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="contrast" labelledBy="businesses-cta">
        <div className="mx-auto max-w-2xl text-center">
          <p lang="en" className="font-serif text-xl text-accent">
            {brand('signature')}
          </p>
          <h2 id="businesses-cta" className="mt-5 font-serif text-2xl text-on-contrast md:text-3xl">
            {brand('name')}
          </h2>
          <p className="mt-4 text-on-contrast-secondary">{t('lead')}</p>
          <div className="mt-8 flex justify-center">
            <CtaLink
              href="/contact"
              event="work_with_me_click"
              location="businesses"
              variant="accent"
              size="lg"
            >
              {nav('workWithMe')}
              <Icon name="arrow" className="size-4" />
            </CtaLink>
          </div>
        </div>
      </Section>
    </>
  )
}
