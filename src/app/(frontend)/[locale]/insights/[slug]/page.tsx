import Image from 'next/image'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { TrackView } from '@/components/analytics/TrackView'
import { PreviewBanner } from '@/components/ui/PreviewBanner'
import { InsightCard } from '@/components/cards/ContentCards'
import { ShareLinks } from '@/components/insights/ShareLinks'
import { articleSchema, breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Icon } from '@/components/ui/Icon'
import { PlaceholderNotice } from '@/components/ui/Notices'
import { extractHeadings, RichText, richTextToPlainText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import {
  getDraftInsightBySlug,
  getExpertiseAreas,
  getInsightBySlug,
  getInsights,
  getSiteSettings,
} from '@/lib/cms'
import { formatDate, isoDate } from '@/lib/format'
import { absoluteUrl, metaDescription, pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getInsightBySlug(locale, slug)
  if (!article) return {}

  const paths = await entryPaths(getInsights, article.id, '/insights')
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: `/insights/${article.slug}`,
    paths,
    title: article.seo.title ?? article.title,
    description:
      article.seo.description ??
      metaDescription(article.excerpt || richTextToPlainText(article.content)),
    image: article.seo.image ?? article.cover?.url ?? settings.defaultOgImage,
    noindex: article.seo.noindex,
    type: 'article',
    publishedTime: article.publishedAt,
  })
}

export default async function InsightDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  // In draft mode (CMS preview) the unpublished version is rendered instead.
  const { isEnabled: isPreview } = await draftMode()
  const article = isPreview
    ? await getDraftInsightBySlug(locale, slug)
    : await getInsightBySlug(locale, slug)
  if (!article) notFound()

  const t = await getTranslations('insights')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')
  const [allArticles, expertise, settings] = await Promise.all([
    getInsights(locale),
    getExpertiseAreas(locale),
    getSiteSettings(locale),
  ])

  const headings = extractHeadings(article.content)
  const related = allArticles
    .filter((entry) => {
      if (entry.id === article.id) return false
      if (article.relatedInsightSlugs.includes(entry.slug)) return true
      return entry.category?.slug === article.category?.slug
    })
    .slice(0, 3)
  const relatedExpertise = expertise.filter((area) =>
    article.relatedExpertiseSlugs.includes(area.slug),
  )
  const url = absoluteUrl(locale, `/insights/${article.slug}`)

  return (
    <>
      <JsonLd
        data={[
          articleSchema(article, locale, settings.name),
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: nav('insights'), path: '/insights' },
              { label: article.title, path: `/insights/${article.slug}` },
            ],
            locale,
          ),
        ]}
      />

      {isPreview ? <PreviewBanner /> : null}

      {!isPreview ? (
        <TrackView event="article_view" id={article.slug} category={article.category?.slug} />
      ) : null}

      <article>
        <header className="border-b border-line bg-surface-subtle">
          <div className="rk-container py-12 md:py-16">
            <Breadcrumbs
              items={[
                { label: nav('home'), href: '/' },
                { label: nav('insights'), href: '/insights' },
                { label: article.title },
              ]}
            />

            {article.category ? (
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
                {article.category.title}
              </p>
            ) : null}

            <h1 className="max-w-4xl font-serif text-[clamp(2rem,4.5vw,3rem)] leading-[1.12] text-primary">
              {article.title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-secondary">{article.excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary">
              <span>{common('author', { name: article.author })}</span>
              {article.publishedAt ? (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={isoDate(article.publishedAt)}>
                    {formatDate(article.publishedAt, locale)}
                  </time>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{common('minuteRead', { minutes: article.readingTime })}</span>
            </div>
          </div>
        </header>

        {article.cover ? (
          <div className="rk-container -mt-0 pt-10">
            <Image
              src={article.cover.url}
              alt={article.cover.alt}
              width={article.cover.width ?? 1600}
              height={article.cover.height ?? 900}
              priority
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="aspect-16/9 w-full rounded-card object-cover"
            />
          </div>
        ) : null}

        <Section>
          {article.isPlaceholder ? <PlaceholderNotice className="mb-10" /> : null}

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <RichText content={article.content} />

              <div className="mt-12 border-t border-line pt-8">
                <ShareLinks url={url} title={article.title} />
              </div>

              {relatedExpertise.length > 0 ? (
                <section aria-labelledby="article-expertise" className="mt-10">
                  <h2
                    id="article-expertise"
                    className="text-sm tracking-[0.14em] text-secondary uppercase"
                  >
                    {common('relatedExpertise')}
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {relatedExpertise.map((area) => (
                      <li key={area.id}>
                        <Link
                          href={`/expertise/${area.slug}`}
                          className="inline-flex rounded-full border border-line px-3 py-1.5 text-sm text-primary transition-colors hover:border-line-accent hover:text-accent-text"
                        >
                          {area.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="lg:col-span-4">
              {headings.length > 1 ? (
                <nav
                  aria-labelledby="article-toc"
                  className="sticky top-[calc(var(--header-height)+1.5rem)] rounded-card border border-line bg-surface-subtle p-5"
                >
                  <h2
                    id="article-toc"
                    className="text-xs tracking-[0.14em] text-secondary uppercase"
                  >
                    {common('tableOfContents')}
                  </h2>
                  <ol className="mt-4 space-y-2.5 text-sm">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="text-secondary underline-offset-4 hover:text-accent-text hover:underline"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <Link
                href="/insights"
                className="mt-8 inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:text-accent-text hover:underline"
              >
                <Icon name="arrow" className="size-4 rotate-180" />
                {t('backToList')}
              </Link>
            </aside>
          </div>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section tone="subtle" labelledBy="article-related">
          <h2 id="article-related" className="rk-rule mb-8 text-2xl">
            {common('relatedArticles')}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {related.map((entry) => (
              <li key={entry.id} className="flex">
                <InsightCard article={entry} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
