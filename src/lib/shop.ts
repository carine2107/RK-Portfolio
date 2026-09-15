/**
 * Direct sales: orders, Stripe Checkout, PayPal and confirmation e-mails, for
 * printed books and digital products (e-books, courses, resources).
 *
 * - The cart is priced here from the CMS (src/lib/shop-pricing.ts).
 * - Payment happens on the provider's hosted page: no card data ever reaches
 *   this site. A delivery address is collected only for printed books.
 * - An order becomes "paid" only from a verified Stripe webhook or a completed
 *   PayPal capture, once (atomic claim on the "pending" status). Digital
 *   products are then unlocked in the buyer's member account.
 *
 * Free of `server-only` like newsletter.ts (API routes, collection hooks).
 */
import type { Payload } from 'payload'
import Stripe from 'stripe'

import { isLocale, type Locale } from '@/i18n/routing'
import { COUNTRY_CODES } from '@/lib/countries'
import { createTransport, emailReady, escapeHtml, wrapHtml } from '@/lib/email-layout'
import { emailConfig, siteUrl } from '@/lib/env'
import { findOrCreateMember, grantEntitlement, sendAccessEmail } from '@/lib/members'
import { signToken, verifyToken } from '@/lib/newsletter-tokens'
import { paypalApiBase, paypalConfig, stripeConfig } from '@/lib/shop-config'
import {
  fromMinor,
  kindOf,
  normaliseLines,
  normaliseVatRate,
  PRODUCT_PREFIX,
  priceOrder,
  recordId,
  type CatalogBook,
  type PricedOrder,
} from '@/lib/shop-pricing'

const ORDER_REF_VALIDITY_MS = 30 * 24 * 60 * 60 * 1000

/** Countries Stripe does not ship to or that are under sanctions. */
const NO_SHIPPING = new Set(['BY', 'CU', 'FM', 'IR', 'KP', 'MH', 'PW', 'RU', 'SD', 'SY'])

const secret = (): string => process.env.PAYLOAD_SECRET || 'development-shop-secret'

export type Provider = 'stripe' | 'paypal'

export type ShopSettings = { enabled: boolean; vatRate: number; notificationEmail: string }

type ShippingAddress = {
  name: string
  line1: string
  line2: string
  postalCode: string
  city: string
  state: string
  country: string
}

type OrderItem = {
  book?: unknown
  product?: unknown
  title: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

type OrderDoc = {
  id: string | number
  number: string
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded'
  provider?: Provider | null
  providerRef?: string | null
  locale?: string | null
  customerEmail?: string | null
  customerName?: string | null
  shipping?: Partial<ShippingAddress> | null
  items?: OrderItem[]
  total: number
  vatRate?: number | null
  vatAmount?: number | null
  currency?: string | null
  trackingUrl?: string | null
}

const localeOf = (value: unknown): Locale =>
  typeof value === 'string' && isLocale(value) ? value : 'en'

const relationId = (value: unknown): string | number | null => {
  if (value && typeof value === 'object' && 'id' in value) {
    return (value as { id: string | number }).id
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

const numericOrString = (id: string): string | number =>
  Number.isNaN(Number(id)) ? id : Number(id)

/* -------------------------------------------------------------------------- */
/* Settings, catalogue, quote                                                 */
/* -------------------------------------------------------------------------- */

export async function readShopSettings(payload: Payload): Promise<ShopSettings> {
  const doc = (await payload.findGlobal({
    slug: 'shop-settings',
    depth: 0,
    overrideAccess: true,
  })) as { enabled?: boolean; vatRate?: number; notificationEmail?: string }
  return {
    enabled: doc.enabled === true,
    vatRate: normaliseVatRate(doc.vatRate),
    notificationEmail: doc.notificationEmail ?? '',
  }
}

async function loadCatalog(
  payload: Payload,
  ids: string[],
  locale: Locale,
): Promise<CatalogBook[]> {
  const bookIds = ids.filter((id) => kindOf(id) === 'book')
  const productIds = ids.filter((id) => kindOf(id) === 'product').map(recordId)
  const catalog: CatalogBook[] = []

  if (bookIds.length > 0) {
    const books = await payload.find({
      collection: 'books',
      where: { id: { in: bookIds } },
      locale,
      depth: 0,
      limit: bookIds.length,
      // Public access rules: only published entries can be bought.
      overrideAccess: false,
    })
    for (const doc of books.docs) {
      const book = doc as unknown as Record<string, unknown>
      catalog.push({
        id: String(book.id),
        kind: 'book',
        title: typeof book.title === 'string' ? book.title : '',
        price: typeof book.price === 'number' ? book.price : null,
        currency: typeof book.currency === 'string' ? book.currency : 'EUR',
        saleType: typeof book.saleType === 'string' ? book.saleType : 'external',
        directOrder: book.directOrderForm === true,
        availability: typeof book.availability === 'string' ? book.availability : 'comingSoon',
        stock: typeof book.stock === 'number' ? book.stock : null,
      })
    }
  }

  if (productIds.length > 0) {
    const products = await payload.find({
      collection: 'products',
      where: { id: { in: productIds } },
      locale,
      depth: 0,
      limit: productIds.length,
      overrideAccess: false,
    })
    for (const doc of products.docs) {
      const product = doc as unknown as Record<string, unknown>
      catalog.push({
        id: `${PRODUCT_PREFIX}${product.id}`,
        kind: 'product',
        title: typeof product.title === 'string' ? product.title : '',
        price: typeof product.price === 'number' ? product.price : null,
        currency: 'EUR',
        saleType: 'direct',
        availability: product.available === false ? 'outOfStock' : 'available',
        stock: null,
      })
    }
  }

  return catalog
}

export async function quoteCart(
  payload: Payload,
  lines: unknown,
  locale: Locale,
): Promise<{ priced: PricedOrder; settings: ShopSettings }> {
  const settings = await readShopSettings(payload)
  const clean = normaliseLines(lines)
  const catalog = await loadCatalog(
    payload,
    clean.map((line) => line.bookId),
    locale,
  )
  return { priced: priceOrder(clean, catalog, settings.vatRate), settings }
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export function orderReference(orderId: string | number): string {
  return signToken(secret(), 'order', orderId, new Date(Date.now() + ORDER_REF_VALIDITY_MS))
}

export async function findOrderByReference(
  payload: Payload,
  reference: string | null,
): Promise<OrderDoc | null> {
  const id = verifyToken(secret(), 'order', reference)
  if (!id) return null
  try {
    return (await payload.findByID({
      collection: 'orders',
      id,
      depth: 0,
      overrideAccess: true,
    })) as unknown as OrderDoc
  } catch {
    return null
  }
}

export async function createPendingOrder(
  payload: Payload,
  priced: PricedOrder,
  input: { locale: Locale; provider: Provider },
): Promise<OrderDoc> {
  const year = new Date().getUTCFullYear()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const count = await payload.count({
      collection: 'orders',
      where: { number: { like: `RK-${year}-` } },
      overrideAccess: true,
    })
    const number = `RK-${year}-${String(count.totalDocs + 1 + attempt).padStart(4, '0')}`
    try {
      return (await payload.create({
        collection: 'orders',
        overrideAccess: true,
        context: { orderInternal: true },
        data: {
          number,
          status: 'pending',
          provider: input.provider,
          locale: input.locale,
          currency: priced.currency,
          total: fromMinor(priced.totalAmount),
          vatRate: priced.vatRate,
          vatAmount: fromMinor(priced.vatAmount),
          // Consent to immediate access, required before checkout (EU withdrawal rules).
          ...(priced.hasDigital ? { digitalWaiverAt: new Date().toISOString() } : {}),
          items: priced.items.map((item) => ({
            ...(item.kind === 'book'
              ? { book: numericOrString(item.bookId) }
              : { product: numericOrString(recordId(item.bookId)) }),
            title: item.title,
            quantity: item.quantity,
            unitPrice: fromMinor(item.unitAmount),
            lineTotal: fromMinor(item.lineAmount),
          })),
        } as never,
      })) as unknown as OrderDoc
    } catch (error) {
      // Unique order number taken by a simultaneous order: try the next one.
      if (attempt === 4) throw error
    }
  }
  throw new Error('Could not allocate an order number')
}

const FREE_SHIPPING: Record<Locale, string> = {
  fr: 'Livraison offerte',
  de: 'Kostenloser Versand',
  en: 'Free delivery',
}

export async function startStripeCheckout(
  payload: Payload,
  order: OrderDoc,
  priced: PricedOrder,
  locale: Locale,
): Promise<string> {
  const stripe = new Stripe(stripeConfig.secretKey)
  const reference = orderReference(order.id)
  const shipping: Partial<Stripe.Checkout.SessionCreateParams> = priced.requiresShipping
    ? {
        shipping_address_collection: {
          allowed_countries: COUNTRY_CODES.filter(
            (code) => !NO_SHIPPING.has(code),
          ) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 0, currency: 'eur' },
              display_name: FREE_SHIPPING[locale],
            },
          },
        ],
      }
    : {}
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: locale === 'de' ? 'de' : locale === 'fr' ? 'fr' : 'en',
    client_reference_id: String(order.id),
    metadata: { orderId: String(order.id), orderNumber: order.number },
    line_items: priced.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: item.unitAmount,
        product_data: { name: item.title },
      },
    })),
    ...shipping,
    success_url: `${siteUrl}/${locale}/checkout/success?ref=${encodeURIComponent(reference)}`,
    cancel_url: `${siteUrl}/${locale}/cart?cancelled=1`,
  })
  if (!session.url) throw new Error('Stripe did not return a checkout URL')

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { providerRef: session.id } as never,
    overrideAccess: true,
    context: { orderInternal: true },
  })
  return session.url
}

async function paypalToken(): Promise<string> {
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!response.ok) throw new Error(`PayPal authentication failed (${response.status})`)
  const body = (await response.json()) as { access_token?: string }
  if (!body.access_token) throw new Error('PayPal returned no access token')
  return body.access_token
}

const money = (amount: number) => ({ currency_code: 'EUR', value: fromMinor(amount).toFixed(2) })

export async function startPaypalCheckout(
  payload: Payload,
  order: OrderDoc,
  priced: PricedOrder,
  locale: Locale,
): Promise<string> {
  const reference = orderReference(order.id)
  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await paypalToken()}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `rk-order-${order.id}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: String(order.id),
          custom_id: String(order.id),
          invoice_id: order.number,
          amount: {
            ...money(priced.totalAmount),
            breakdown: { item_total: money(priced.totalAmount) },
          },
          items: priced.items.map((item) => ({
            name: item.title.slice(0, 127),
            quantity: String(item.quantity),
            unit_amount: money(item.unitAmount),
            category: item.kind === 'book' ? 'PHYSICAL_GOODS' : 'DIGITAL_GOODS',
          })),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Romial Kenmogne',
            locale: locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'en-GB',
            shipping_preference: priced.requiresShipping ? 'GET_FROM_FILE' : 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${siteUrl}/api/shop/paypal/return?ref=${encodeURIComponent(reference)}`,
            cancel_url: `${siteUrl}/${locale}/cart?cancelled=1`,
          },
        },
      },
    }),
  })
  if (!response.ok) throw new Error(`PayPal order creation failed (${response.status})`)
  const body = (await response.json()) as { id?: string; links?: { rel: string; href: string }[] }
  const approve = body.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')
  if (!body.id || !approve) throw new Error('PayPal returned no approval link')

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { providerRef: body.id } as never,
    overrideAccess: true,
    context: { orderInternal: true },
  })
  return approve.href
}

/**
 * Captures an approved PayPal order. Returns the paid order, or null when the
 * reference, the PayPal order or the capture is not valid.
 */
export async function capturePaypalOrder(
  payload: Payload,
  reference: string | null,
  paypalOrderId: string | null,
): Promise<OrderDoc | null> {
  const order = await findOrderByReference(payload, reference)
  if (!order || !paypalOrderId || order.provider !== 'paypal') return null
  if (order.status !== 'pending') return order.status === 'paid' ? order : null
  if (order.providerRef !== paypalOrderId) return null

  const response = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await paypalToken()}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `rk-capture-${order.id}`,
      },
    },
  )
  const body = (await response.json()) as {
    status?: string
    payer?: { email_address?: string; name?: { given_name?: string; surname?: string } }
    purchase_units?: {
      shipping?: {
        name?: { full_name?: string }
        address?: {
          address_line_1?: string
          address_line_2?: string
          admin_area_1?: string
          admin_area_2?: string
          postal_code?: string
          country_code?: string
        }
      }
    }[]
  }
  if (!response.ok || body.status !== 'COMPLETED') return null

  const shipping = body.purchase_units?.[0]?.shipping
  await markOrderPaid(payload, order.id, {
    providerRef: paypalOrderId,
    email: body.payer?.email_address ?? '',
    name: [body.payer?.name?.given_name, body.payer?.name?.surname].filter(Boolean).join(' '),
    shipping: {
      name: shipping?.name?.full_name ?? '',
      line1: shipping?.address?.address_line_1 ?? '',
      line2: shipping?.address?.address_line_2 ?? '',
      postalCode: shipping?.address?.postal_code ?? '',
      city: shipping?.address?.admin_area_2 ?? '',
      state: shipping?.address?.admin_area_1 ?? '',
      country: shipping?.address?.country_code ?? '',
    },
  })
  return findOrderByReference(payload, reference)
}

/* -------------------------------------------------------------------------- */
/* Payment confirmation                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Marks a pending order as paid, once. Returns false when the order was not
 * pending any more (webhook retried, double trigger).
 */
export async function markOrderPaid(
  payload: Payload,
  orderId: string | number,
  details: { providerRef: string; email: string; name: string; shipping: ShippingAddress },
): Promise<boolean> {
  const hasAddress = Boolean(details.shipping.line1 || details.shipping.city)
  const claimed = await payload.update({
    collection: 'orders',
    where: { and: [{ id: { equals: orderId } }, { status: { equals: 'pending' } }] },
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
      providerRef: details.providerRef,
      customerEmail: details.email.trim().toLowerCase(),
      customerName: details.name || details.shipping.name,
      ...(hasAddress ? { shipping: details.shipping } : {}),
    } as never,
    overrideAccess: true,
    context: { orderInternal: true },
  })
  const order = claimed.docs[0] as unknown as OrderDoc | undefined
  if (!order) return false

  const items = order.items ?? []

  // Printed books: decrement tracked stock; a book reaching 0 becomes "out of stock".
  for (const item of items) {
    const bookId = relationId(item.book)
    if (bookId === null) continue
    try {
      const book = (await payload.findByID({
        collection: 'books',
        id: bookId,
        depth: 0,
        overrideAccess: true,
      })) as unknown as { stock?: number | null }
      if (typeof book.stock === 'number') {
        const stock = Math.max(0, book.stock - item.quantity)
        await payload.update({
          collection: 'books',
          id: bookId,
          data: { stock, ...(stock === 0 ? { availability: 'outOfStock' } : {}) } as never,
          overrideAccess: true,
        })
      }
    } catch {
      /* the book was deleted meanwhile: nothing to update */
    }
  }

  // Digital products: unlock them in the buyer's member account.
  const digital = items.filter((item) => relationId(item.product) !== null)
  if (digital.length > 0) {
    if (order.customerEmail) {
      try {
        const member = await findOrCreateMember(payload, {
          email: order.customerEmail,
          locale: localeOf(order.locale),
          name: order.customerName ?? '',
        })
        for (const item of digital) {
          await grantEntitlement(
            payload,
            member.id,
            relationId(item.product) as string | number,
            order.id,
          )
        }
        await sendAccessEmail(
          payload,
          member,
          digital.map((item) => item.title),
        )
      } catch (error) {
        console.error(
          `[shop] Digital access for order ${order.number} failed:`,
          error instanceof Error ? error.message : 'unknown error',
        )
      }
    } else {
      console.error(
        `[shop] Order ${order.number} paid without e-mail: digital access to grant by hand.`,
      )
    }
  }

  await sendOrderEmails(payload, order)
  return true
}

type StripeSession = {
  id: string
  payment_status?: string
  client_reference_id?: string | null
  metadata?: Record<string, string> | null
  customer_details?: {
    email?: string | null
    name?: string | null
    address?: StripeAddress | null
  } | null
  collected_information?: {
    shipping_details?: { name?: string; address?: StripeAddress } | null
  } | null
  shipping_details?: { name?: string; address?: StripeAddress } | null
}
type StripeAddress = {
  line1?: string | null
  line2?: string | null
  postal_code?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

export async function handleStripeEvent(
  payload: Payload,
  event: { type: string; data: { object: unknown } },
): Promise<'paid' | 'cancelled' | 'ignored'> {
  const session = event.data.object as StripeSession
  const orderId = session.metadata?.orderId ?? session.client_reference_id ?? null
  if (!orderId) return 'ignored'

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    // Delayed payment methods complete the session before the money arrives.
    if (session.payment_status !== 'paid') return 'ignored'
    const shipping = session.collected_information?.shipping_details ?? session.shipping_details
    const address = shipping?.address ?? {}
    const paid = await markOrderPaid(payload, orderId, {
      providerRef: session.id,
      email: session.customer_details?.email ?? '',
      name: session.customer_details?.name ?? '',
      shipping: {
        name: shipping?.name ?? session.customer_details?.name ?? '',
        line1: address.line1 ?? '',
        line2: address.line2 ?? '',
        postalCode: address.postal_code ?? '',
        city: address.city ?? '',
        state: address.state ?? '',
        country: address.country ?? '',
      },
    })
    return paid ? 'paid' : 'ignored'
  }

  if (event.type === 'checkout.session.expired') {
    const cancelled = await payload.update({
      collection: 'orders',
      where: { and: [{ id: { equals: orderId } }, { status: { equals: 'pending' } }] },
      data: { status: 'cancelled' } as never,
      overrideAccess: true,
      context: { orderInternal: true },
    })
    return cancelled.docs.length > 0 ? 'cancelled' : 'ignored'
  }

  return 'ignored'
}

/* -------------------------------------------------------------------------- */
/* E-mails (FR / DE / EN)                                                     */
/* -------------------------------------------------------------------------- */

const MAIL: Record<
  Locale,
  {
    confirmSubject: (n: string) => string
    greeting: (name: string) => string
    confirmBody: string
    printedNote: string
    digitalNote: string
    shippedSubject: (n: string) => string
    shippedBody: string
    tracking: string
    item: string
    quantity: string
    total: string
    vat: (rate: string) => string
    shipping: string
    free: string
    deliverTo: string
    ownerSubject: (n: string) => string
    ownerIntro: string
    ownerShip: string
    footer: string
  }
> = {
  fr: {
    confirmSubject: (n) => `Confirmation de commande ${n} — Romial Kenmogne`,
    greeting: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    confirmBody:
      'Merci pour votre commande. Le paiement est confirmé. Le reçu de paiement vous est envoyé séparément par le prestataire de paiement.',
    printedNote:
      'Votre livre sera expédié prochainement et vous recevrez un e-mail à l’expédition.',
    digitalNote:
      'Vos produits numériques sont disponibles dans votre espace membre : un e-mail séparé contient votre lien de connexion.',
    shippedSubject: (n) => `Votre commande ${n} a été expédiée`,
    shippedBody: 'Bonne nouvelle : votre commande vient d’être expédiée.',
    tracking: 'Suivre le colis',
    item: 'Article',
    quantity: 'Qté',
    total: 'Total',
    vat: (rate) => `dont TVA ${rate} %`,
    shipping: 'Livraison',
    free: 'offerte',
    deliverTo: 'Adresse de livraison',
    ownerSubject: (n) => `Nouvelle commande ${n}`,
    ownerIntro: 'Une commande vient d’être payée sur le site :',
    ownerShip: 'Des livres imprimés sont à expédier.',
    footer: 'Romial Kenmogne — Books & Publications',
  },
  de: {
    confirmSubject: (n) => `Bestellbestätigung ${n} — Romial Kenmogne`,
    greeting: (name) => (name ? `Guten Tag ${name},` : 'Guten Tag,'),
    confirmBody:
      'Vielen Dank für Ihre Bestellung. Die Zahlung ist bestätigt. Den Zahlungsbeleg erhalten Sie separat vom Zahlungsanbieter.',
    printedNote: 'Ihr Buch wird in Kürze versendet und Sie erhalten beim Versand eine E-Mail.',
    digitalNote:
      'Ihre digitalen Produkte stehen in Ihrem Mitgliederbereich bereit: Eine separate E-Mail enthält Ihren Anmeldelink.',
    shippedSubject: (n) => `Ihre Bestellung ${n} wurde versendet`,
    shippedBody: 'Gute Nachricht: Ihre Bestellung wurde soeben versendet.',
    tracking: 'Sendung verfolgen',
    item: 'Artikel',
    quantity: 'Menge',
    total: 'Gesamt',
    vat: (rate) => `inkl. ${rate} % MwSt.`,
    shipping: 'Versand',
    free: 'kostenlos',
    deliverTo: 'Lieferadresse',
    ownerSubject: (n) => `Neue Bestellung ${n}`,
    ownerIntro: 'Auf der Website wurde soeben eine Bestellung bezahlt:',
    ownerShip: 'Gedruckte Bücher sind zu versenden.',
    footer: 'Romial Kenmogne — Books & Publications',
  },
  en: {
    confirmSubject: (n) => `Order confirmation ${n} — Romial Kenmogne`,
    greeting: (name) => (name ? `Dear ${name},` : 'Hello,'),
    confirmBody:
      'Thank you for your order. Payment is confirmed. The payment receipt is sent to you separately by the payment provider.',
    printedNote: 'Your book will be shipped shortly and you will receive an e-mail when it leaves.',
    digitalNote:
      'Your digital products are available in your member area: a separate e-mail contains your sign-in link.',
    shippedSubject: (n) => `Your order ${n} has been shipped`,
    shippedBody: 'Good news: your order has just been shipped.',
    tracking: 'Track the parcel',
    item: 'Item',
    quantity: 'Qty',
    total: 'Total',
    vat: (rate) => `incl. ${rate}% VAT`,
    shipping: 'Delivery',
    free: 'free',
    deliverTo: 'Delivery address',
    ownerSubject: (n) => `New order ${n}`,
    ownerIntro: 'An order has just been paid on the website:',
    ownerShip: 'Printed books are to be shipped.',
    footer: 'Romial Kenmogne — Books & Publications',
  },
}

const INTL_LOCALE: Record<Locale, string> = { fr: 'fr-FR', de: 'de-DE', en: 'en-GB' }

const hasPrinted = (order: OrderDoc) =>
  (order.items ?? []).some((item) => relationId(item.book) !== null)
const hasDigital = (order: OrderDoc) =>
  (order.items ?? []).some((item) => relationId(item.product) !== null)

function orderSummary(order: OrderDoc, locale: Locale): { html: string; text: string } {
  const t = MAIL[locale]
  const format = (value: number) =>
    new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'currency',
      currency: order.currency ?? 'EUR',
    }).format(value)
  const printed = hasPrinted(order)
  const rows = (order.items ?? []).map(
    (item) =>
      [`${item.title}`, String(item.quantity), format(item.lineTotal)] as [string, string, string],
  )
  const vat =
    order.vatRate && order.vatAmount
      ? `${t.vat(String(order.vatRate).replace('.', locale === 'en' ? '.' : ','))}: ${format(order.vatAmount)}`
      : ''
  const address =
    printed && order.shipping
      ? [
          order.shipping.name,
          order.shipping.line1,
          order.shipping.line2,
          [order.shipping.postalCode, order.shipping.city].filter(Boolean).join(' '),
          order.shipping.state,
          order.shipping.country,
        ].filter((line): line is string => Boolean(line))
      : []

  const cell = 'padding:6px 0;border-bottom:1px solid #dfe4ea'
  const html =
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse">` +
    `<tr><th align="left" style="${cell}">${escapeHtml(t.item)}</th><th align="right" style="${cell}">${escapeHtml(t.quantity)}</th><th align="right" style="${cell}">${escapeHtml(t.total)}</th></tr>` +
    rows
      .map(
        ([title, quantity, total]) =>
          `<tr><td style="padding:6px 0">${escapeHtml(title)}</td><td align="right">${quantity}</td><td align="right">${escapeHtml(total)}</td></tr>`,
      )
      .join('') +
    (printed
      ? `<tr><td style="padding:6px 0">${escapeHtml(t.shipping)}</td><td></td><td align="right">${escapeHtml(t.free)}</td></tr>`
      : '') +
    `<tr><td style="padding:8px 0;border-top:1px solid #dfe4ea;font-weight:600">${escapeHtml(t.total)}</td><td style="border-top:1px solid #dfe4ea"></td><td align="right" style="border-top:1px solid #dfe4ea;font-weight:600">${escapeHtml(format(order.total))}</td></tr>` +
    `</table>` +
    (vat ? `<p style="margin:6px 0 0;color:#465568;font-size:12px">${escapeHtml(vat)}</p>` : '') +
    (address.length
      ? `<p style="margin:16px 0 0;font-size:14px"><strong>${escapeHtml(t.deliverTo)}</strong><br>${address.map(escapeHtml).join('<br>')}</p>`
      : '')

  const text = [
    ...rows.map(([title, quantity, total]) => `${quantity} × ${title} — ${total}`),
    ...(printed ? [`${t.shipping}: ${t.free}`] : []),
    `${t.total}: ${format(order.total)}`,
    vat,
    '',
    address.length ? `${t.deliverTo}:\n${address.join('\n')}` : '',
  ].join('\n')

  return { html, text }
}

async function sendOrderEmails(payload: Payload, order: OrderDoc): Promise<void> {
  if (!emailReady()) {
    console.info(
      `[shop] Order ${order.number} paid — e-mail delivery disabled, no confirmation sent.`,
    )
    return
  }
  const locale = localeOf(order.locale)
  const t = MAIL[locale]
  const summary = orderSummary(order, locale)
  const body = [
    t.confirmBody,
    hasPrinted(order) ? t.printedNote : '',
    hasDigital(order) ? t.digitalNote : '',
  ]
    .filter(Boolean)
    .join(' ')
  const transport = createTransport()

  try {
    if (order.customerEmail) {
      await transport.sendMail({
        from: emailConfig.from,
        to: order.customerEmail,
        subject: t.confirmSubject(order.number),
        text: [t.greeting(order.customerName ?? ''), '', body, '', summary.text, '', t.footer].join(
          '\n',
        ),
        html: wrapHtml(
          t.confirmSubject(order.number),
          `<p style="margin:0 0 12px">${escapeHtml(t.greeting(order.customerName ?? ''))}</p><p style="margin:0 0 16px">${escapeHtml(body)}</p>${summary.html}`,
          t.footer,
        ),
      })
    }

    const settings = await readShopSettings(payload)
    const owner = settings.notificationEmail || emailConfig.to
    if (owner) {
      const ownerText = MAIL.fr
      const intro = [ownerText.ownerIntro, hasPrinted(order) ? ownerText.ownerShip : '']
        .filter(Boolean)
        .join(' ')
      const ownerSummary = orderSummary(order, 'fr')
      const adminUrl = `${siteUrl}/admin/collections/orders/${order.id}`
      await transport.sendMail({
        from: emailConfig.from,
        to: owner,
        replyTo: order.customerEmail || undefined,
        subject: ownerText.ownerSubject(order.number),
        text: [intro, '', ownerSummary.text, '', adminUrl].join('\n'),
        html: wrapHtml(
          ownerText.ownerSubject(order.number),
          `<p style="margin:0 0 16px">${escapeHtml(intro)}</p>${ownerSummary.html}<p style="margin:16px 0 0"><a href="${escapeHtml(adminUrl)}">${escapeHtml(order.number)}</a></p>`,
          ownerText.footer,
        ),
      })
    }
  } catch (error) {
    // Never log addresses or order contents.
    console.error(
      `[shop] Confirmation e-mails for order ${order.number} failed:`,
      error instanceof Error ? error.message : 'unknown error',
    )
  }
}

/** E-mail sent when an order is marked "shipped" in the administration. */
export async function sendShippedEmail(order: OrderDoc): Promise<void> {
  if (!emailReady() || !order.customerEmail) return
  const locale = localeOf(order.locale)
  const t = MAIL[locale]
  const tracking =
    order.trackingUrl && /^https:\/\//.test(order.trackingUrl) ? order.trackingUrl : ''
  try {
    await createTransport().sendMail({
      from: emailConfig.from,
      to: order.customerEmail,
      subject: t.shippedSubject(order.number),
      text: [
        t.greeting(order.customerName ?? ''),
        '',
        t.shippedBody,
        tracking ? `${t.tracking}: ${tracking}` : '',
        '',
        t.footer,
      ].join('\n'),
      html: wrapHtml(
        t.shippedSubject(order.number),
        `<p style="margin:0 0 12px">${escapeHtml(t.greeting(order.customerName ?? ''))}</p><p style="margin:0 0 12px">${escapeHtml(t.shippedBody)}</p>` +
          (tracking
            ? `<p style="margin:0 0 12px"><a href="${escapeHtml(tracking)}" style="color:#6f571f">${escapeHtml(t.tracking)}</a></p>`
            : ''),
        t.footer,
      ),
    })
  } catch (error) {
    console.error(
      `[shop] Shipping e-mail for order ${order.number} failed:`,
      error instanceof Error ? error.message : 'unknown error',
    )
  }
}
