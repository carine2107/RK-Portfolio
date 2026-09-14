import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { AddToCart } from '@/components/shop/AddToCart'
import { Notice, PlaceholderNotice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import { getProductBySlug, getProducts, getShopStatus, getSiteSettings } from '@/lib/cms'
import { formatPrice } from '@/lib/format'
import { metaDescription, pageMetadata } from '@/lib/seo'
import { PRODUCT_PREFIX } from '@/lib/shop-pricing'

export const revalidate = 300

type Props = { params: Promise<{ locale: Locale; slug: string }> }

const LANGUAGE_NAMES: Record<string, Record<Locale, string>> = {
  fr: { fr: 'Français', de: 'Französisch', en: 'French' },
  en: { fr: 'Anglais', de: 'Englisch', en: 'English' },
  de: { fr: 'Allemand', de: 'Deutsch', en: 'German' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(locale, slug)
  if (!product) return {}
  const paths = await entryPaths(getProducts, product.id, '/products')
  const settings = await getSiteSettings(locale)
  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    paths,
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? metaDescription(product.summary),
    image: product.seo.image ?? product.cover?.url ?? settings.defaultOgImage,
    noindex: product.seo.noindex,
  })
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const product = await getProductBySlug(locale, slug)
  if (!product) notFound()

  const t = await getTranslations('products')
  const nav = await getTranslations('nav')
  const shop = await getShopStatus()
  const lessonCount = product.modules.reduce((sum, module) => sum + module.lessons.length, 0)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: t('title'), path: '/products' },
            { label: product.title, path: `/products/${product.slug}` },
          ],
          locale,
        )}
      />
      <PageHeader
        eyebrow={t(`types.${product.type}`)}
        title={product.title}
        lead={product.summary}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: t('title'), href: '/products' },
          { label: product.title },
        ]}
      />

      <Section>
        {product.isPlaceholder ? <PlaceholderNotice className="mb-10" /> : null}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            {product.cover ? (
              <Image
                src={product.cover.url}
                alt={product.cover.alt}
                width={product.cover.width ?? 1600}
                height={product.cover.height ?? 900}
                priority
                sizes="(min-width: 1024px) 48rem, 100vw"
                className="mb-10 aspect-16/9 w-full rounded-card object-cover"
              />
            ) : null}
            {product.description ? <RichText content={product.description} /> : null}

            {product.type === 'course' && product.modules.length > 0 ? (
              <section aria-labelledby="product-syllabus" className="mt-12">
                <h2 id="product-syllabus" className="rk-rule text-2xl">
                  {t('syllabus')}
                </h2>
                <p className="mt-3 text-sm text-secondary">
                  {t('lessons', { count: lessonCount })}
                </p>
                <ol className="mt-6 space-y-6">
                  {product.modules.map((module, index) => (
                    <li
                      key={`${module.title}-${index}`}
                      className="rounded-card border border-line p-5"
                    >
                      <h3 className="font-medium text-primary">
                        {index + 1}. {module.title}
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-secondary">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex justify-between gap-4">
                            <span>{lesson.title}</span>
                            {lesson.durationMinutes ? (
                              <span className="shrink-0">
                                {t('minutes', { count: lesson.durationMinutes })}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-card border border-line bg-surface-subtle p-6">
              <p className="text-2xl font-semibold text-primary">
                {formatPrice(product.price, 'EUR', locale)}
              </p>
              {product.languages.length > 0 ? (
                <p className="mt-2 text-sm text-secondary">
                  {t('languagesList', {
                    list: product.languages
                      .map((code) => LANGUAGE_NAMES[code]?.[locale] ?? code)
                      .join(', '),
                  })}
                </p>
              ) : null}
              <div className="mt-6">
                {shop.active && product.available ? (
                  <AddToCart
                    bookId={`${PRODUCT_PREFIX}${product.id}`}
                    slug={product.slug}
                    digital
                  />
                ) : (
                  <Notice tone="warning">{t('notForSale')}</Notice>
                )}
              </div>
              <p className="mt-4 text-sm text-secondary">{t('accessNote')}</p>
              <Link
                href="/account"
                className="mt-4 inline-block text-sm text-accent-text underline-offset-4 hover:underline"
              >
                {t('alreadyBought')}
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
