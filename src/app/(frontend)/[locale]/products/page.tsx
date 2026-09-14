import Image from 'next/image'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { PlaceholderBadge } from '@/components/ui/Notices'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getProducts, getSiteSettings } from '@/lib/cms'
import { formatPrice } from '@/lib/format'
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
                <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface-raised transition-[border-color,box-shadow] hover:border-line-accent hover:shadow-raised">
                  {product.cover ? (
                    <div className="relative aspect-16/9 bg-surface-sunken">
                      <Image
                        src={product.cover.url}
                        alt={product.cover.alt}
                        fill
                        sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold tracking-[0.18em] text-accent-text uppercase">
                      {t(`types.${product.type}`)}
                    </p>
                    <h2 className="mt-3 text-xl leading-snug text-primary">
                      <Link
                        href={`/products/${product.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {product.title}
                      </Link>
                    </h2>
                    <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-secondary">
                      {product.summary}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <span className="font-semibold text-primary">
                        {formatPrice(product.price, 'EUR', locale)}
                      </span>
                      {product.isPlaceholder ? <PlaceholderBadge /> : null}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
