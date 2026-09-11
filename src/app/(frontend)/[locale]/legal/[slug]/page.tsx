import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { Notice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText, richTextToPlainText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { getLegalPageBySlug, getLegalPages, legalSlug } from '@/lib/cms'
import { formatDate } from '@/lib/format'
import { metaDescription, pageMetadata, type LocalePaths } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale; slug: string }> }

async function legalPaths(type: string): Promise<LocalePaths> {
  const paths: LocalePaths = {}
  for (const locale of locales) {
    paths[locale] = `/legal/${legalSlug(type, locale)}`
  }
  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getLegalPageBySlug(locale, slug)
  if (!page) return {}

  const t = await getTranslations({ locale, namespace: 'legal' })

  return pageMetadata({
    locale,
    path: `/legal/${page.slug}`,
    paths: await legalPaths(page.type),
    title: page.seo.title ?? page.title,
    description:
      page.seo.description ??
      metaDescription(richTextToPlainText(page.content) || t('meta.description')),
    // Legal drafts pending review must not be indexed.
    noindex: page.seo.noindex || page.needsLegalReview,
  })
}

export default async function LegalPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const page = await getLegalPageBySlug(locale, slug)
  if (!page) notFound()

  const t = await getTranslations('legal')
  const nav = await getTranslations('nav')
  const pages = await getLegalPages(locale)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: page.title, path: `/legal/${page.slug}` },
          ],
          locale,
        )}
      />

      <PageHeader
        eyebrow={t('title')}
        title={page.title}
        crumbs={[{ label: nav('home'), href: '/' }, { label: page.title }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            {page.needsLegalReview ? (
              <Notice tone="warning" title={t('reviewNoticeTitle')} className="mb-8">
                {t('reviewNoticeBody')}
              </Notice>
            ) : null}

            <RichText content={page.content} />

            {page.lastUpdated ? (
              <p className="mt-10 border-t border-line pt-6 text-sm text-secondary">
                {t('lastUpdated', { date: formatDate(page.lastUpdated, locale) })}
              </p>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <nav
              aria-labelledby="legal-nav"
              className="rounded-card border border-line bg-surface-subtle p-6"
            >
              <h2 id="legal-nav" className="text-xs tracking-[0.14em] text-secondary uppercase">
                {t('title')}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {pages.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/legal/${entry.slug}`}
                      aria-current={entry.slug === page.slug ? 'page' : undefined}
                      className={
                        entry.slug === page.slug
                          ? 'text-accent-text'
                          : 'text-secondary underline-offset-4 hover:text-primary hover:underline'
                      }
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </Section>
    </>
  )
}
