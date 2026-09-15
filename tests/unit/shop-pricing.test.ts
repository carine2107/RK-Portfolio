import { describe, expect, it } from 'vitest'

import {
  MAX_QUANTITY,
  kindOf,
  normaliseLines,
  normaliseVatRate,
  priceOrder,
  recordId,
  type CatalogBook,
} from '@/lib/shop-pricing'

const book = (overrides: Partial<CatalogBook> = {}): CatalogBook => ({
  id: '1',
  title: 'Réussir son premier achat immobilier en Europe',
  price: 24.9,
  currency: 'EUR',
  saleType: 'direct',
  availability: 'available',
  stock: null,
  ...overrides,
})

const ebook = (overrides: Partial<CatalogBook> = {}): CatalogBook =>
  book({ id: 'p-7', kind: 'product', title: 'E-book', price: 9.9, ...overrides })

describe('cart lines sent by the browser', () => {
  it('merges duplicates, bounds quantities and drops junk', () => {
    expect(
      normaliseLines([
        { bookId: '1', quantity: 2 },
        { bookId: '1', quantity: 3 },
        { bookId: '2', quantity: 999 },
        { bookId: '../x', quantity: 1 },
        { bookId: '3', quantity: 0 },
        { bookId: '4', quantity: 'two' },
        null,
        'nope',
      ]),
    ).toEqual([
      { bookId: '1', quantity: 5 },
      { bookId: '2', quantity: MAX_QUANTITY },
    ])
    expect(normaliseLines('not an array')).toEqual([])
  })

  it('buys a digital product only once', () => {
    expect(normaliseLines([{ bookId: 'p-7', quantity: 3 }])).toEqual([
      { bookId: 'p-7', quantity: 1 },
    ])
    expect(kindOf('p-7')).toBe('product')
    expect(kindOf('12')).toBe('book')
    expect(recordId('p-7')).toBe('7')
    expect(recordId('12')).toBe('12')
  })
})

describe('order pricing', () => {
  it('uses the CMS price, never the browser', () => {
    const order = priceOrder([{ bookId: '1', quantity: 2 }], [book()], 0)
    expect(order.items).toEqual([
      {
        bookId: '1',
        kind: 'book',
        title: 'Réussir son premier achat immobilier en Europe',
        quantity: 2,
        unitAmount: 2490,
        lineAmount: 4980,
      },
    ])
    expect(order.totalAmount).toBe(4980)
    expect(order.vatAmount).toBe(0)
  })

  it('extracts the VAT included in the price', () => {
    // 49.80 € gross at 7 % → 3.26 € of VAT.
    const order = priceOrder([{ bookId: '1', quantity: 2 }], [book()], 7)
    expect(order.vatRate).toBe(7)
    expect(order.vatAmount).toBe(326)
  })

  it('removes items that cannot be bought directly', () => {
    const catalog = [
      book({ id: 'external', saleType: 'external' }),
      book({ id: 'soon', availability: 'comingSoon' }),
      book({ id: 'free', price: 0 }),
      book({ id: 'xaf', currency: 'XAF' }),
      book({ id: 'empty', stock: 0 }),
      book({ id: 'ok' }),
    ]
    const order = priceOrder(
      ['external', 'soon', 'free', 'xaf', 'empty', 'missing', 'ok'].map((bookId) => ({
        bookId,
        quantity: 1,
      })),
      catalog,
      0,
    )
    expect(order.items.map((item) => item.bookId)).toEqual(['ok'])
    expect(order.removed).toEqual(['external', 'soon', 'free', 'xaf', 'empty', 'missing'])
  })

  it('sells a retailer book directly only when direct purchase is offered', () => {
    const catalog = [
      book({ id: 'retailer-only', saleType: 'external' }),
      book({ id: 'retailer-and-site', saleType: 'external', directOrder: true }),
      book({ id: 'site-no-price', saleType: 'external', directOrder: true, price: null }),
      book({ id: 'info-only', saleType: 'none', directOrder: true }),
    ]
    const order = priceOrder(
      catalog.map((entry) => ({ bookId: entry.id, quantity: 1 })),
      catalog,
      0,
    )
    expect(order.items.map((item) => item.bookId)).toEqual(['retailer-and-site'])
    expect(order.removed).toEqual(['retailer-only', 'site-no-price', 'info-only'])
  })

  it('never sells more than the stock', () => {
    const order = priceOrder([{ bookId: '1', quantity: 5 }], [book({ stock: 2 })], 0)
    expect(order.items[0]?.quantity).toBe(2)
  })

  it('knows when a delivery address and the digital waiver are needed', () => {
    const printed = priceOrder([{ bookId: '1', quantity: 1 }], [book()], 0)
    expect([printed.requiresShipping, printed.hasDigital]).toEqual([true, false])

    const digital = priceOrder([{ bookId: 'p-7', quantity: 4 }], [ebook()], 0)
    expect([digital.requiresShipping, digital.hasDigital]).toEqual([false, true])
    expect(digital.items[0]?.quantity).toBe(1)

    const both = priceOrder(
      [
        { bookId: '1', quantity: 1 },
        { bookId: 'p-7', quantity: 1 },
      ],
      [book(), ebook()],
      0,
    )
    expect([both.requiresShipping, both.hasDigital, both.totalAmount]).toEqual([true, true, 3480])
  })

  it('accepts only a plausible VAT rate', () => {
    expect(normaliseVatRate(7)).toBe(7)
    expect(normaliseVatRate('19')).toBe(19)
    for (const value of [0, -7, 45, 'abc', null, undefined]) expect(normaliseVatRate(value)).toBe(0)
  })
})
