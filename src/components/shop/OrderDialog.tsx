'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useRef, useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { addToCart, cartCount, useCart } from '@/components/shop/cart-store'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notices'
import { Link } from '@/i18n/navigation'
import { MAX_QUANTITY } from '@/lib/shop-pricing'
import type { BookView } from '@/lib/types'

/**
 * "Order here" under the retailer links: opens a dialog to add the book to the
 * cart, then offers to keep browsing or to go to the cart and pay.
 */
export function OrderDialog({
  book,
  purchasable,
}: {
  book: Pick<BookView, 'id' | 'slug' | 'title' | 'cover' | 'price' | 'currency'>
  /** The book can be sold directly (same rule as the server-side pricing). */
  purchasable: boolean
}) {
  const t = useTranslations('books.buy')
  const locale = useLocale()
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const lines = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const open = () => {
    setAdded(false)
    setQuantity(1)
    dialogRef.current?.showModal()
    trackEvent('book_purchase_click', { book: book.slug, url: 'order-dialog' })
  }
  const close = () => dialogRef.current?.close()

  const price =
    book.price !== null
      ? new Intl.NumberFormat(locale, { style: 'currency', currency: book.currency }).format(
          book.price,
        )
      : ''

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        aria-haspopup="dialog"
        onClick={open}
      >
        {t('orderHere')}
        <Icon name="arrow" className="size-4" />
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          // A click on the backdrop (outside the panel) closes the dialog.
          if (event.target === event.currentTarget) close()
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-line bg-surface p-0 text-primary shadow-float backdrop:bg-black/60"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={`${id}-title`} className="font-serif text-2xl text-primary">
              {t('dialog.title')}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={t('dialog.close')}
              className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-secondary hover:text-primary"
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-sm border border-line bg-surface-subtle">
              {book.cover ? (
                <Image src={book.cover.url} alt="" fill sizes="4rem" className="object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p lang="fr" className="font-medium text-primary">
                {book.title}
              </p>
              {price ? <p className="mt-1 text-sm text-secondary">{price}</p> : null}
            </div>
          </div>

          {!purchasable ? (
            <div className="mt-6 space-y-4">
              <Notice tone="info">{t('dialog.unavailable')}</Notice>
              <Button type="button" variant="secondary" className="w-full" onClick={close}>
                {t('dialog.close')}
              </Button>
            </div>
          ) : added ? (
            <div className="mt-6 space-y-3">
              <p role="status" className="flex items-center gap-2 text-sm text-success-text">
                {t('dialog.added')}
                <span className="text-secondary">
                  {t('dialog.cartCount', { count: cartCount(lines) })}
                </span>
              </p>
              <Link href="/cart" className={buttonClasses('primary', 'lg', 'w-full')}>
                {t('dialog.toCart')}
                <Icon name="arrow" className="size-4" />
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={close}
              >
                {t('dialog.continue')}
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor={`${id}-quantity`} className="text-sm font-medium text-primary">
                  {t('dialog.quantity')}
                </label>
                <select
                  id={`${id}-quantity`}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-primary"
                >
                  {Array.from({ length: MAX_QUANTITY }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => {
                  addToCart(book.id, quantity)
                  setAdded(true)
                  trackEvent('add_to_cart', { book: book.slug })
                }}
              >
                <Icon name="plus" className="size-4" />
                {t('addToCart')}
              </Button>
              <p className="text-sm text-secondary">{t('orderHereNote')}</p>
            </div>
          )}
        </div>
      </dialog>
    </>
  )
}
