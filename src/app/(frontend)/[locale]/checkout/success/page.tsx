import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CheckoutSuccess } from '@/components/shop/CheckoutSuccess'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shop.success' })
  return pageMetadata({
    locale,
    path: '/checkout/success',
    title: t('title'),
    description: t('title'),
    noindex: true,
  })
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('shop.success')

  return (
    <>
      <PageHeader title={t('title')} />
      <Section>
        <CheckoutSuccess />
      </Section>
    </>
  )
}
