import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CartView } from '@/components/shop/CartView'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { legalSlug } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shop.cart' })
  return pageMetadata({
    locale,
    path: '/cart',
    title: t('title'),
    description: t('title'),
    noindex: true,
  })
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('shop.cart')
  const nav = await getTranslations('nav')

  return (
    <>
      <PageHeader
        title={t('title')}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: nav('books'), href: '/books' },
          { label: t('title') },
        ]}
      />
      <Section>
        <CartView
          termsHref={`/legal/${legalSlug('terms', locale)}`}
          returnsHref={`/legal/${legalSlug('returns', locale)}`}
        />
      </Section>
    </>
  )
}
