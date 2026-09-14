import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsletterAction } from '@/components/newsletter/NewsletterAction'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'newsletter.unsubscribe' })
  return pageMetadata({
    locale,
    path: '/newsletter/unsubscribe',
    title: t('title'),
    description: t('title'),
    noindex: true,
  })
}

export default async function NewsletterUnsubscribePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('newsletter')

  return (
    <>
      <PageHeader
        title={t('unsubscribe.title')}
        crumbs={[{ label: t('title'), href: '/newsletter' }]}
      />
      <Section>
        <NewsletterAction mode="unsubscribe" />
      </Section>
    </>
  )
}
