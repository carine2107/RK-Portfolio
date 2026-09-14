import Image from 'next/image'

import { BookCard } from '@/components/cards/ContentCards'
import { ProductCard } from '@/components/cards/ProductCard'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { VideoEmbed } from '@/components/speaking/VideoEmbed'
import { buttonClasses } from '@/components/ui/Button'
import { CtaLink } from '@/components/ui/CtaLink'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section, SectionHeading } from '@/components/ui/Section'
import type { BookView, CampaignBlock, CampaignLink, ProductView } from '@/lib/types'
import { parseVideoUrl } from '@/lib/video'

type Variant = 'primary' | 'secondary' | 'accent' | 'onContrast'

function CampaignButton({
  link,
  campaign,
  variant,
  size = 'lg',
}: {
  link: CampaignLink
  campaign: string
  variant: Variant
  size?: 'md' | 'lg'
}) {
  if (!link) return null
  if (link.external) {
    return (
      <ExternalLink
        href={link.href}
        event="campaign_cta_click"
        payload={{ campaign }}
        className={buttonClasses(variant, size)}
      >
        {link.label}
        <Icon name="external" className="size-4" />
      </ExternalLink>
    )
  }
  return (
    <CtaLink
      href={link.href}
      event="campaign_cta_click"
      location={`campaign:${campaign}`}
      variant={variant}
      size={size}
    >
      {link.label}
      <Icon name="arrow" className="size-4" />
    </CtaLink>
  )
}

/** Renders the blocks of a campaign page, in the order chosen in the CMS. */
export function CampaignBlocks({
  blocks,
  campaign,
  pageTitle,
  books,
  products,
  newsletterEnabled,
  privacyHref,
}: {
  blocks: CampaignBlock[]
  campaign: string
  pageTitle: string
  books: BookView[]
  products: ProductView[]
  newsletterEnabled: boolean
  privacyHref: string
}) {
  return (
    <>
      {blocks.map((block, index) => {
        const headingId = `campaign-${block.id}`

        switch (block.type) {
          case 'hero': {
            // Only the first hero carries the page's H1.
            const Heading = index === 0 ? 'h1' : 'h2'
            return (
              <div key={block.id} className="border-b border-line bg-surface-subtle">
                <div className="rk-container grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
                  <div className={block.image ? 'lg:col-span-7' : 'lg:col-span-10'}>
                    {block.eyebrow ? (
                      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
                        {block.eyebrow}
                      </p>
                    ) : null}
                    <Heading className="font-serif text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.1] text-primary">
                      {block.heading || pageTitle}
                    </Heading>
                    {block.lead ? (
                      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-secondary">
                        {block.lead}
                      </p>
                    ) : null}
                    {block.cta ? (
                      <div className="mt-8">
                        <CampaignButton link={block.cta} campaign={campaign} variant="accent" />
                      </div>
                    ) : null}
                  </div>
                  {block.image ? (
                    <div className="lg:col-span-5">
                      <Image
                        src={block.image.url}
                        alt={block.image.alt}
                        width={block.image.width ?? 1200}
                        height={block.image.height ?? 900}
                        priority={index === 0}
                        sizes="(min-width: 1024px) 32rem, 100vw"
                        className="w-full rounded-card object-cover shadow-raised"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          }

          case 'text':
            return (
              <Section key={block.id} labelledBy={block.heading ? headingId : undefined}>
                <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
                  <div
                    className={
                      block.image
                        ? `lg:col-span-7 ${block.imagePosition === 'left' ? 'lg:order-2' : ''}`
                        : 'lg:col-span-9'
                    }
                  >
                    {block.heading ? (
                      <h2 id={headingId} className="rk-rule mb-6 text-2xl md:text-3xl">
                        {block.heading}
                      </h2>
                    ) : null}
                    <RichText content={block.content} />
                  </div>
                  {block.image ? (
                    <div className="lg:col-span-5">
                      <Image
                        src={block.image.url}
                        alt={block.image.alt}
                        width={block.image.width ?? 1200}
                        height={block.image.height ?? 900}
                        sizes="(min-width: 1024px) 32rem, 100vw"
                        className="w-full rounded-card object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </Section>
            )

          case 'features':
            return (
              <Section
                key={block.id}
                tone="subtle"
                labelledBy={block.heading ? headingId : undefined}
              >
                {block.heading ? (
                  <SectionHeading
                    id={headingId}
                    title={block.heading}
                    intro={block.intro || undefined}
                  />
                ) : null}
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {block.items.map((item, itemIndex) => (
                    <li
                      key={`${item.title}-${itemIndex}`}
                      className="rounded-card border border-line bg-surface-raised p-6"
                    >
                      <h3 className="text-lg font-medium text-primary">{item.title}</h3>
                      {item.description ? (
                        <p className="mt-2 text-[0.95rem] leading-relaxed text-secondary">
                          {item.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Section>
            )

          case 'video': {
            const video = parseVideoUrl(block.videoUrl)
            if (!video) return null
            return (
              <Section key={block.id} labelledBy={block.heading ? headingId : undefined}>
                <div className="mx-auto max-w-4xl">
                  {block.heading ? (
                    <h2 id={headingId} className="rk-rule mb-8 text-2xl md:text-3xl">
                      {block.heading}
                    </h2>
                  ) : null}
                  <VideoEmbed
                    video={video}
                    title={block.heading || pageTitle}
                    poster={block.poster}
                  />
                </div>
              </Section>
            )
          }

          case 'books': {
            const shown = block.bookIds
              .map((id) => books.find((book) => book.id === id))
              .filter((book): book is BookView => Boolean(book))
            if (shown.length === 0) return null
            return (
              <Section key={block.id} labelledBy={block.heading ? headingId : undefined}>
                {block.heading ? <SectionHeading id={headingId} title={block.heading} /> : null}
                <ul
                  className={
                    shown.length === 1 ? 'grid max-w-3xl gap-6' : 'grid gap-6 lg:grid-cols-2'
                  }
                >
                  {shown.map((book) => (
                    <li key={book.id} className="flex">
                      <BookCard book={book} />
                    </li>
                  ))}
                </ul>
              </Section>
            )
          }

          case 'products': {
            const shown = block.productIds
              .map((id) => products.find((product) => product.id === id))
              .filter((product): product is ProductView => Boolean(product))
            if (shown.length === 0) return null
            return (
              <Section key={block.id} labelledBy={block.heading ? headingId : undefined}>
                {block.heading ? <SectionHeading id={headingId} title={block.heading} /> : null}
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {shown.map((product) => (
                    <li key={product.id} className="flex">
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              </Section>
            )
          }

          case 'faq':
            return (
              <Section
                key={block.id}
                tone="subtle"
                labelledBy={block.heading ? headingId : undefined}
              >
                <div className="mx-auto max-w-3xl">
                  {block.heading ? (
                    <h2 id={headingId} className="rk-rule mb-8 text-2xl md:text-3xl">
                      {block.heading}
                    </h2>
                  ) : null}
                  <div className="divide-y divide-line rounded-card border border-line bg-surface-raised">
                    {block.items.map((item, itemIndex) => (
                      <details key={`${item.question}-${itemIndex}`} className="group px-6">
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-primary">
                          {item.question}
                          <Icon
                            name="plus"
                            className="size-5 shrink-0 text-accent-text transition-transform group-open:rotate-45"
                          />
                        </summary>
                        <p className="pb-5 leading-relaxed whitespace-pre-line text-secondary">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </Section>
            )

          case 'cta':
            return (
              <Section key={block.id} tone="contrast" labelledBy={headingId}>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 id={headingId} className="font-serif text-2xl text-on-contrast md:text-3xl">
                    {block.heading}
                  </h2>
                  {block.body ? (
                    <p className="mt-4 whitespace-pre-line text-on-contrast-secondary">
                      {block.body}
                    </p>
                  ) : null}
                  {block.primary || block.secondary ? (
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <CampaignButton link={block.primary} campaign={campaign} variant="accent" />
                      <CampaignButton
                        link={block.secondary}
                        campaign={campaign}
                        variant="onContrast"
                      />
                    </div>
                  ) : null}
                </div>
              </Section>
            )

          case 'newsletter':
            if (!newsletterEnabled) return null
            return (
              <Section key={block.id} labelledBy={block.heading ? headingId : undefined}>
                <div className="mx-auto grid max-w-5xl gap-8 rounded-card border border-line bg-surface-subtle p-6 md:p-10 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    {block.heading ? (
                      <h2 id={headingId} className="font-serif text-2xl text-primary">
                        {block.heading}
                      </h2>
                    ) : null}
                    {block.body ? <p className="mt-3 text-secondary">{block.body}</p> : null}
                  </div>
                  <div className="lg:col-span-7">
                    <NewsletterForm
                      privacyHref={privacyHref}
                      source={`campaign:${campaign}`.slice(0, 40)}
                    />
                  </div>
                </div>
              </Section>
            )
        }
      })}
    </>
  )
}
