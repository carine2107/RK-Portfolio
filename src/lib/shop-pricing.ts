/**
 * Server-side pricing of a cart. The browser only sends item ids and
 * quantities: prices, availability and VAT always come from the CMS here, so
 * a tampered cart can never change what is charged.
 *
 * Two kinds of items share the cart: printed books (`"12"`) and digital
 * products (`"p-7"`: e-books, courses, resources). Amounts are integers in
 * cents to avoid floating-point errors. Pure module (unit-tested).
 */

export const MAX_QUANTITY = 10
export const MAX_LINES = 20
/** Only EUR is sold directly (Stripe and PayPal both support it). */
export const SHOP_CURRENCY = 'EUR'
/** Cart id prefix of a digital product. */
export const PRODUCT_PREFIX = 'p-'

export type CartLine = { bookId: string; quantity: number }

export type ItemKind = 'book' | 'product'

export type CatalogBook = {
  /** Cart id: "12" for a book, "p-7" for a digital product. */
  id: string
  kind?: ItemKind
  title: string
  price: number | null
  currency: string
  saleType: string
  availability: string
  /** null = not tracked (unlimited). */
  stock: number | null
}

export type PricedItem = {
  bookId: string
  kind: ItemKind
  title: string
  quantity: number
  unitAmount: number
  lineAmount: number
}

export type PricedOrder = {
  items: PricedItem[]
  currency: typeof SHOP_CURRENCY
  totalAmount: number
  /** VAT rate included in the prices, in percent (0 = no VAT shown). */
  vatRate: number
  vatAmount: number
  /** Item ids dropped because they cannot be bought directly any more. */
  removed: string[]
  /** A printed book is in the order: a delivery address is needed. */
  requiresShipping: boolean
  /** A digital product is in the order: immediate access and withdrawal waiver. */
  hasDigital: boolean
}

export const toMinor = (value: number): number => Math.round(value * 100)
export const fromMinor = (amount: number): number => amount / 100

export const kindOf = (id: string): ItemKind => (id.startsWith(PRODUCT_PREFIX) ? 'product' : 'book')

/** Database id behind a cart id ("p-7" → "7"). */
export const recordId = (id: string): string =>
  id.startsWith(PRODUCT_PREFIX) ? id.slice(PRODUCT_PREFIX.length) : id

export function isPurchasable(book: CatalogBook): boolean {
  return (
    book.saleType === 'direct' &&
    book.currency === SHOP_CURRENCY &&
    typeof book.price === 'number' &&
    book.price > 0 &&
    (book.availability === 'available' || book.availability === 'preorder') &&
    (book.stock === null || book.stock > 0)
  )
}

/** Cleans what the browser sent: valid ids, merged duplicates, bounded quantities. */
export function normaliseLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return []
  const merged = new Map<string, number>()
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue
    const { bookId, quantity } = entry as { bookId?: unknown; quantity?: unknown }
    const id = typeof bookId === 'string' || typeof bookId === 'number' ? String(bookId) : ''
    if (!/^(p-)?[\w]{1,64}$/.test(id)) continue
    const count = Math.floor(Number(quantity))
    if (!Number.isFinite(count) || count < 1) continue
    // A digital product is bought once: quantity is always 1.
    const max = kindOf(id) === 'product' ? 1 : MAX_QUANTITY
    merged.set(id, Math.min(max, (merged.get(id) ?? 0) + count))
    if (merged.size >= MAX_LINES) break
  }
  return [...merged].map(([bookId, quantity]) => ({ bookId, quantity }))
}

export function normaliseVatRate(value: unknown): number {
  const rate = Number(value)
  return Number.isFinite(rate) && rate > 0 && rate <= 30 ? Math.round(rate * 100) / 100 : 0
}

export function priceOrder(
  lines: CartLine[],
  catalog: CatalogBook[],
  vatRate: number,
): PricedOrder {
  const items: PricedItem[] = []
  const removed: string[] = []

  for (const line of lines) {
    const book = catalog.find((entry) => entry.id === line.bookId)
    if (!book || !isPurchasable(book)) {
      removed.push(line.bookId)
      continue
    }
    const kind = book.kind ?? kindOf(book.id)
    const wanted = kind === 'product' ? 1 : line.quantity
    const quantity = book.stock === null ? wanted : Math.min(wanted, book.stock)
    const unitAmount = toMinor(book.price as number)
    items.push({
      bookId: book.id,
      kind,
      title: book.title,
      quantity,
      unitAmount,
      lineAmount: unitAmount * quantity,
    })
  }

  const totalAmount = items.reduce((sum, item) => sum + item.lineAmount, 0)
  const rate = normaliseVatRate(vatRate)
  // Prices include VAT: the VAT part of a gross amount G at rate r is G·r/(100+r).
  const vatAmount = rate > 0 ? Math.round((totalAmount * rate) / (100 + rate)) : 0

  return {
    items,
    currency: SHOP_CURRENCY,
    totalAmount,
    vatRate: rate,
    vatAmount,
    removed,
    requiresShipping: items.some((item) => item.kind === 'book'),
    hasDigital: items.some((item) => item.kind === 'product'),
  }
}
