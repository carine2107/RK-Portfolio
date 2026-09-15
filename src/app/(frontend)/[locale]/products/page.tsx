import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProductCard } from '@/components/cards/ProductCard'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getProducts, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products.meta' })
  const settings = await getSiteSettings(locale)
  return pageMetadata({
    locale,
    path: '/products',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('products')
  const nav = await getTranslations('nav')
  const products = await getProducts(locale)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: t('title'), path: '/products' },
          ],
          locale,
        )}
      />
      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: t('title') }]}
      >
        <Link
          href="/account"
          className="text-sm text-accent-text underline-offset-4 hover:underline"
        >
          {t('alreadyBought')}
        </Link>
      </PageHeader>

      <Section>
        {products.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard product={product} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
