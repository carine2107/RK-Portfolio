import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CampaignBlocks } from '@/components/campaign/CampaignBlocks'
import { breadcrumbSchema, faqSchema, JsonLd } from '@/components/seo/JsonLd'
import { PageHeader } from '@/components/ui/PageHeader'
import { PreviewBanner } from '@/components/ui/PreviewBanner'
import type { Locale } from '@/i18n/routing'
import { entryPaths } from '@/lib/alternates'
import {
  getBooks,
  getCampaignBySlug,
  getCampaigns,
  getProducts,
  getSiteSettings,
  legalSlug,
  getDraftCampaignBySlug,
} from '@/lib/cms'
import { emailReady } from '@/lib/email-layout'
import { metaDescription, pageMetadata } from '@/lib/seo'

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const campaign = await getCampaignBySlug(locale, slug)
  if (!campaign) return {}

  const paths = await entryPaths(getCampaigns, campaign.id, '/campaigns')
  const settings = await getSiteSettings(locale)
  const hero = campaign.blocks.find((block) => block.type === 'hero')

  return pageMetadata({
    locale,
    path: `/campaigns/${campaign.slug}`,
    paths,
    title: campaign.seo.title ?? campaign.title,
    description: campaign.seo.description ?? metaDescription(campaign.summary),
    image:
      campaign.seo.image ??
      (hero?.type === 'hero' ? hero.image?.url : undefined) ??
      settings.defaultOgImage,
    noindex: campaign.seo.noindex,
  })
}

export default async function CampaignPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  // In draft mode (CMS preview) the unpublished version is shown when there is one.
  const { isEnabled: isPreview } = await draftMode()
  const campaign =
    (isPreview ? await getDraftCampaignBySlug(locale, slug) : null) ??
    (await getCampaignBySlug(locale, slug))
  if (!campaign) notFound()

  const nav = await getTranslations('nav')
  const needsBooks = campaign.blocks.some((block) => block.type === 'books')
  const needsProducts = campaign.blocks.some((block) => block.type === 'products')
  const [books, products] = await Promise.all([
    needsBooks ? getBooks(locale) : [],
    needsProducts ? getProducts(locale) : [],
  ])
  const faqs = campaign.blocks.flatMap((block) => (block.type === 'faq' ? block.items : []))
  const startsWithHero = campaign.blocks[0]?.type === 'hero'

  return (
    <>
      {isPreview ? <PreviewBanner /> : null}
      <JsonLd
        data={[
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: campaign.title, path: `/campaigns/${campaign.slug}` },
            ],
            locale,
          ),
          ...(faqs.length > 0 ? [faqSchema(faqs)] : []),
        ]}
      />

      {startsWithHero ? null : (
        <PageHeader
          title={campaign.title}
          lead={campaign.summary}
          crumbs={[{ label: nav('home'), href: '/' }, { label: campaign.title }]}
        />
      )}

      <CampaignBlocks
        blocks={campaign.blocks}
        campaign={campaign.slug}
        pageTitle={campaign.title}
        books={books}
        products={products}
        newsletterEnabled={emailReady()}
        privacyHref={`/legal/${legalSlug('privacy', locale)}`}
      />
    </>
  )
}
