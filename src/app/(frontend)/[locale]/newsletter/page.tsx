import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getSiteSettings, legalSlug } from '@/lib/cms'
import { emailReady } from '@/lib/email-layout'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'newsletter.meta' })
  const settings = await getSiteSettings(locale)
  return pageMetadata({
    locale,
    path: '/newsletter',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('newsletter')
  const nav = await getTranslations('nav')
  const enabled = emailReady()

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: t('title'), path: '/newsletter' },
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
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <ul className="space-y-5 lg:col-span-5">
            {(['point1', 'point2', 'point3'] as const).map((key) => (
              <li key={key} className="flex gap-3 text-secondary">
                <Icon name="arrow" className="mt-1 size-4 shrink-0 text-accent" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-card border border-line bg-surface-subtle p-6 md:p-8 lg:col-span-7">
            <h2 className="rk-rule mb-6 text-2xl">{t('formTitle')}</h2>
            {enabled ? (
              <NewsletterForm
                privacyHref={`/legal/${legalSlug('privacy', locale)}`}
                source="newsletter_page"
              />
            ) : (
              <Notice tone="warning" role="status">
                {t('unavailable')}
              </Notice>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
