import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, eventSchema, JsonLd, videoSchema } from '@/components/seo/JsonLd'
import { VideoEmbed } from '@/components/speaking/VideoEmbed'
import { CtaLink } from '@/components/ui/CtaLink'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { PlaceholderNotice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import { getEngagementBySlug, getEngagements, getSiteSettings } from '@/lib/cms'
import { formatDate, isoDate } from '@/lib/format'
import { metaDescription, pageMetadata } from '@/lib/seo'
import { parseVideoUrl } from '@/lib/video'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

/**
 * No path is rendered at build time; each one is rendered on its first visit and
 * then cached like the list pages. Without this export `revalidate` has no effect
 * on a dynamic segment and the page is rendered again on every request.
 */
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ locale: Locale; slug: string }> }

const LANGUAGE_NAMES: Record<string, Record<Locale, string>> = {
  fr: { fr: 'Français', de: 'Französisch', en: 'French' },
  en: { fr: 'Anglais', de: 'Englisch', en: 'English' },
  de: { fr: 'Allemand', de: 'Deutsch', en: 'German' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const entry = await getEngagementBySlug(locale, slug)
  if (!entry) return {}

  const paths = await entryPaths(getEngagements, entry.id, '/speaking')
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: `/speaking/${entry.slug}`,
    paths,
    title: entry.seo.title ?? entry.title,
    description: entry.seo.description ?? metaDescription(entry.summary),
    image: entry.seo.image ?? entry.cover?.url ?? settings.defaultOgImage,
    noindex: entry.seo.noindex,
  })
}

export default async function EngagementPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const entry = await getEngagementBySlug(locale, slug)
  if (!entry) notFound()

  const t = await getTranslations('speaking')
  const nav = await getTranslations('nav')
  const video = parseVideoUrl(entry.videoUrl)
  const place = [entry.city, entry.country].filter(Boolean).join(', ')
  const schema = eventSchema(entry, locale)
  const videoLd = video ? videoSchema(entry, locale) : null

  const facts: { label: string; value: React.ReactNode }[] = [
    {
      label: t('detail.date'),
      value: (
        <time dateTime={isoDate(entry.date)}>
          {formatDate(entry.date, locale)}
          {entry.endDate && formatDate(entry.endDate, locale) !== formatDate(entry.date, locale)
            ? ` – ${formatDate(entry.endDate, locale)}`
            : ''}
        </time>
      ),
    },
    ...(entry.eventName ? [{ label: t('detail.event'), value: entry.eventName }] : []),
    ...(entry.organiser ? [{ label: t('detail.organiser'), value: entry.organiser }] : []),
    ...(place ? [{ label: t('detail.location'), value: place }] : []),
    ...(entry.durationMinutes
      ? [{ label: t('detail.duration'), value: t('minutes', { count: entry.durationMinutes }) }]
      : []),
    ...(entry.topics.length > 0
      ? [
          {
            label: t('detail.topics'),
            value: (
              <span className="flex flex-wrap gap-x-3 gap-y-1">
                {entry.topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/expertise/${topic.slug}`}
                    className="text-accent-text underline-offset-4 hover:underline"
                  >
                    {topic.title}
                  </Link>
                ))}
              </span>
            ),
          },
        ]
      : []),
    ...(entry.languages.length > 0
      ? [
          {
            label: t('detail.languages'),
            value: entry.languages.map((code) => LANGUAGE_NAMES[code]?.[locale] ?? code).join(', '),
          },
        ]
      : []),
  ]

  return (
    <>
      <JsonLd
        data={[
          ...(schema ? [schema] : []),
          ...(videoLd ? [videoLd] : []),
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: nav('speaking'), path: '/speaking' },
              { label: entry.title, path: `/speaking/${entry.slug}` },
            ],
            locale,
          ),
        ]}
      />

      <PageHeader
        eyebrow={t(`types.${entry.type}`)}
        title={entry.title}
        lead={entry.summary}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: nav('speaking'), href: '/speaking' },
          { label: entry.title },
        ]}
      />

      <Section>
        {entry.isPlaceholder ? <PlaceholderNotice className="mb-10" /> : null}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            {video ? (
              <VideoEmbed video={video} title={entry.title} poster={entry.cover} />
            ) : entry.cover ? (
              <Image
                src={entry.cover.url}
                alt={entry.cover.alt}
                width={entry.cover.width ?? 1600}
                height={entry.cover.height ?? 900}
                priority
                sizes="(min-width: 1024px) 48rem, 100vw"
                className="aspect-16/9 w-full rounded-card object-cover"
              />
            ) : null}

            {entry.description ? (
              <RichText
                content={entry.description}
                className={video || entry.cover ? 'mt-10' : ''}
              />
            ) : null}

            {entry.externalUrl ? (
              <p className="mt-8">
                <ExternalLink
                  href={entry.externalUrl}
                  event="media_link_click"
                  payload={{ engagement: entry.slug }}
                  className="inline-flex items-center gap-2 font-medium text-accent-text underline-offset-4 hover:underline"
                >
                  {entry.externalLabel || t('detail.externalDefault')}
                  <Icon name="external" className="size-4" />
                </ExternalLink>
              </p>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <dl className="divide-y divide-line rounded-card border border-line bg-surface-subtle px-6">
              {facts.map((fact) => (
                <div key={fact.label} className="py-4">
                  <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-base text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 rounded-card border border-line p-6">
              <h2 className="text-base font-semibold text-primary">{t('invite.title')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{t('invite.body')}</p>
              <CtaLink
                href="/contact?type=speaking"
                event="work_with_me_click"
                location="speaking_detail"
                variant="primary"
                className="mt-5"
              >
                {t('invite.cta')}
                <Icon name="arrow" className="size-4" />
              </CtaLink>
            </div>

            <p className="mt-8">
              <Link
                href="/speaking"
                className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:text-accent-text hover:underline"
              >
                <Icon name="arrow" className="size-4 rotate-180" />
                {t('detail.back')}
              </Link>
            </p>
          </aside>
        </div>
      </Section>
    </>
  )
}
