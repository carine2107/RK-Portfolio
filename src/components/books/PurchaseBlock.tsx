'use client'

import { useTranslations } from 'next-intl'

import { trackEvent } from '@/components/analytics/track'
import { Flag } from '@/components/i18n/Flag'
import { AddToCart } from '@/components/shop/AddToCart'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import { isPurchasable } from '@/lib/shop-pricing'
import type { BookView } from '@/lib/types'

/** Country of a retailer, read from its domain (amazon.de, amazon.fr, amazon.co.uk). */
function retailerCountry(url: string): 'fr' | 'de' | 'en' | null {
  try {
    const host = new URL(url).hostname
    if (host.endsWith('.de')) return 'de'
    if (host.endsWith('.fr')) return 'fr'
    if (host.endsWith('.co.uk') || host.endsWith('.uk')) return 'en'
  } catch {
    /* not a valid URL: no flag */
  }
  return null
}

/**
 * Purchase area of a book: retailer links, direct sale on the site, or both.
 *
 * Direct purchase is only offered when it can really be paid (shop opened in the
 * CMS and payment keys configured) and the book is purchasable by the same rule as
 * the server-side pricing. Until then a book that offers direct purchase shows
 * "Order here", which opens the contact form: no payment is ever simulated.
 */
export function PurchaseBlock({
  book,
  shopActive = false,
}: {
  book: BookView
  /** Direct sale can really be paid (shop opened and payment keys configured). */
  shopActive?: boolean
}) {
  const t = useTranslations('books')
  const directPurchase =
    shopActive &&
    isPurchasable({
      id: book.id,
      title: book.title,
      price: book.price,
      currency: book.currency,
      saleType: book.saleType,
      directOrder: book.directOrderForm,
      availability: book.availability,
      stock: book.stock,
    })

  if (book.saleType === 'external' && book.purchaseLinks.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        {book.purchaseLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('book_purchase_click', { book: book.slug, url: link.url })}
            className={buttonClasses('primary', 'lg', 'w-full')}
          >
            {retailerCountry(link.url) ? <Flag locale={retailerCountry(link.url) ?? 'fr'} /> : null}
            {link.label || t('buy.external')}
            <Icon name="external" className="size-4" />
            <span className="sr-only">({t('buy.externalNote')})</span>
          </a>
        ))}
        <p className="text-sm text-secondary">{t('buy.externalNote')}</p>
        {book.directOrderForm && directPurchase ? (
          <div className="mt-2 border-t border-line pt-4">
            <AddToCart bookId={book.id} slug={book.slug} />
          </div>
        ) : book.directOrderForm ? (
          <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
            {/* Online payment not available yet: the request goes through the contact
                form and is handled manually. */}
            <Link
              href={`/contact?type=bookOrder&subject=${encodeURIComponent(
                t('buy.orderSubject', { title: book.title }),
              )}`}
              onClick={() =>
                trackEvent('book_purchase_click', { book: book.slug, url: 'contact-form' })
              }
              className={buttonClasses('secondary', 'lg', 'w-full')}
            >
              {t('buy.orderHere')}
              <Icon name="arrow" className="size-4" />
            </Link>
            <p className="text-sm text-secondary">{t('buy.orderHereNote')}</p>
          </div>
        ) : null}
      </div>
    )
  }

  if (book.saleType === 'direct' && directPurchase) {
    return <AddToCart bookId={book.id} slug={book.slug} />
  }

  if (book.saleType === 'direct') {
    return (
      <div className="flex flex-col gap-3">
        <Notice tone="warning" title={t('buy.directPending')}>
          {t('buy.directPendingNote')}
        </Notice>
        <Link href="/contact" className={buttonClasses('primary', 'lg')}>
          {t('buy.contact')}
          <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <Link href="/contact" className={buttonClasses('secondary', 'lg')}>
      {t('buy.contact')}
      <Icon name="arrow" className="size-4" />
    </Link>
  )
}
