'use client'

import { useTranslations } from 'next-intl'

import { trackEvent } from '@/components/analytics/track'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import type { BookView } from '@/lib/types'

/**
 * Purchase area of a book.
 *
 * The data model supports the hybrid sales model (external retailer / direct
 * sale). Direct sale is intentionally NOT wired to a checkout: no payment
 * provider is configured, so the site says so instead of simulating a shop.
 */
export function PurchaseBlock({ book }: { book: BookView }) {
  const t = useTranslations('books')

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
            className={buttonClasses('primary', 'lg')}
          >
            {link.label || t('buy.external')}
            <Icon name="external" className="size-4" />
          </a>
        ))}
        <p className="text-sm text-secondary">{t('buy.externalNote')}</p>
      </div>
    )
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
