import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { PlaceholderBadge } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatPrice } from '@/lib/format'
import type { ProductView } from '@/lib/types'

/** Card of a digital product, linking to its public page. */
export async function ProductCard({ product }: { product: ProductView }) {
  const t = await getTranslations('products')
  const locale = (await getLocale()) as Locale

  return (
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
        <h3 className="mt-3 text-xl leading-snug text-primary">
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0">
            {product.title}
          </Link>
        </h3>
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
  )
}
