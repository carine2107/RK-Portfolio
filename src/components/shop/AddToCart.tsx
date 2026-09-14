'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { addToCart, cartCount, useCart } from '@/components/shop/cart-store'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'

/** "Add to cart" for a book or digital product sold directly, with a link to the cart once added. */
export function AddToCart({
  bookId,
  slug,
  digital = false,
}: {
  bookId: string
  slug: string
  digital?: boolean
}) {
  const t = useTranslations('books.buy')
  const lines = useCart()
  const [added, setAdded] = useState(false)
  const count = cartCount(lines)

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={() => {
          addToCart(bookId)
          setAdded(true)
          trackEvent('add_to_cart', { book: slug })
        }}
      >
        <Icon name="plus" className="size-4" />
        {t('addToCart')}
      </Button>
      <p
        role="status"
        aria-live="polite"
        className={added ? 'text-sm text-success-text' : 'sr-only'}
      >
        {added ? t('added') : ''}
      </p>
      {count > 0 ? (
        <Link href="/cart" className={buttonClasses('secondary', 'lg', 'w-full')}>
          {t('viewCart', { count })}
          <Icon name="arrow" className="size-4" />
        </Link>
      ) : null}
      <p className="text-sm text-secondary">{digital ? t('digitalNote') : t('directNote')}</p>
    </div>
  )
}
