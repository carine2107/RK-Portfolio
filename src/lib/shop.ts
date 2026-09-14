/**
 * Direct book sales: orders, Stripe Checkout, PayPal and confirmation e-mails.
 *
 * - The cart is priced here from the CMS (src/lib/shop-pricing.ts).
 * - Payment happens on the provider's hosted page: no card data ever reaches
 *   this site. Shipping addresses are collected by the provider.
 * - An order becomes "paid" only from a verified Stripe webhook or a completed
 *   PayPal capture, once (atomic claim on the "pending" status).
 *
 * Free of `server-only` like newsletter.ts (API routes, collection hooks).
 */
import type { Payload } from 'payload'
import Stripe from 'stripe'

import { isLocale, type Locale } from '@/i18n/routing'
import { COUNTRY_CODES } from '@/lib/countries'
import { createTransport, emailReady, escapeHtml, wrapHtml } from '@/lib/email-layout'
import { emailConfig, siteUrl } from '@/lib/env'
import { signToken, verifyToken } from '@/lib/newsletter-tokens'
import { paypalApiBase, paypalConfig, stripeConfig } from '@/lib/shop-config'
import {
  fromMinor,
  normaliseLines,
  normaliseVatRate,
  priceOrder,
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
  items?: {
    book?: unknown
    title: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
  total: number
  vatRate?: number | null
  vatAmount?: number | null
  currency?: string | null
  trackingUrl?: string | null
}

const localeOf = (value: unknown): Locale =>
  typeof value === 'string' && isLocale(value) ? value : 'en'

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
  if (ids.length === 0) return []
  const result = await payload.find({
    collection: 'books',
    where: { id: { in: ids } },
    locale,
    depth: 0,
    limit: ids.length,
    // Public access rules: only published books can be bought.
    overrideAccess: false,
  })
  return result.docs.map((doc) => {
    const book = doc as unknown as Record<string, unknown>
    return {
      id: String(book.id),
      title: typeof book.title === 'string' ? book.title : '',
      price: typeof book.price === 'number' ? book.price : null,
      currency: typeof book.currency === 'string' ? book.currency : 'EUR',
      saleType: typeof book.saleType === 'string' ? book.saleType : 'external',
      availability: typeof book.availability === 'string' ? book.availability : 'comingSoon',
      stock: typeof book.stock === 'number' ? book.stock : null,
    }
  })
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
          items: priced.items.map((item) => ({
            book: Number.isNaN(Number(item.bookId)) ? item.bookId : Number(item.bookId),
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
            category: 'PHYSICAL_GOODS',
          })),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Romial Kenmogne',
            locale: locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'en-GB',
            shipping_preference: 'GET_FROM_FILE',
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
  const claimed = await payload.update({
    collection: 'orders',
    where: { and: [{ id: { equals: orderId } }, { status: { equals: 'pending' } }] },
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
      providerRef: details.providerRef,
      customerEmail: details.email,
      customerName: details.name || details.shipping.name,
      shipping: details.shipping,
    } as never,
    overrideAccess: true,
    context: { orderInternal: true },
  })
  const order = claimed.docs[0] as unknown as OrderDoc | undefined
  if (!order) return false

  // Stock: decrement tracked books; a book reaching 0 becomes "out of stock".
  for (const item of order.items ?? []) {
    const bookId =
      typeof item.book === 'object' && item.book !== null
        ? (item.book as { id: string | number }).id
        : (item.book as string | number | undefined)
    if (bookId === undefined) continue
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
    const address = shipping?.address ?? session.customer_details?.address ?? {}
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
    footer: string
  }
> = {
  fr: {
    confirmSubject: (n) => `Confirmation de commande ${n} — Romial Kenmogne`,
    greeting: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    confirmBody:
      'Merci pour votre commande. Le paiement est confirmé ; votre livre sera expédié prochainement et vous recevrez un e-mail à l’expédition. Le reçu de paiement vous est envoyé séparément par le prestataire de paiement.',
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
    ownerIntro: 'Une commande vient d’être payée sur le site. À expédier :',
    footer: 'Romial Kenmogne — Books & Publications',
  },
  de: {
    confirmSubject: (n) => `Bestellbestätigung ${n} — Romial Kenmogne`,
    greeting: (name) => (name ? `Guten Tag ${name},` : 'Guten Tag,'),
    confirmBody:
      'Vielen Dank für Ihre Bestellung. Die Zahlung ist bestätigt; Ihr Buch wird in Kürze versendet und Sie erhalten beim Versand eine E-Mail. Den Zahlungsbeleg erhalten Sie separat vom Zahlungsanbieter.',
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
    ownerIntro: 'Auf der Website wurde soeben eine Bestellung bezahlt. Zu versenden:',
    footer: 'Romial Kenmogne — Books & Publications',
  },
  en: {
    confirmSubject: (n) => `Order confirmation ${n} — Romial Kenmogne`,
    greeting: (name) => (name ? `Dear ${name},` : 'Hello,'),
    confirmBody:
      'Thank you for your order. Payment is confirmed; your book will be shipped shortly and you will receive an e-mail when it leaves. The payment receipt is sent to you separately by the payment provider.',
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
    ownerIntro: 'An order has just been paid on the website. To ship:',
    footer: 'Romial Kenmogne — Books & Publications',
  },
}

const INTL_LOCALE: Record<Locale, string> = { fr: 'fr-FR', de: 'de-DE', en: 'en-GB' }

function orderSummary(order: OrderDoc, locale: Locale): { html: string; text: string } {
  const t = MAIL[locale]
  const format = (value: number) =>
    new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'currency',
      currency: order.currency ?? 'EUR',
    }).format(value)
  const rows = (order.items ?? []).map(
    (item) =>
      [`${item.title}`, String(item.quantity), format(item.lineTotal)] as [string, string, string],
  )
  const vat =
    order.vatRate && order.vatAmount
      ? `${t.vat(String(order.vatRate).replace('.', locale === 'en' ? '.' : ','))}: ${format(order.vatAmount)}`
      : ''
  const address = order.shipping
    ? [
        order.shipping.name,
        order.shipping.line1,
        order.shipping.line2,
        [order.shipping.postalCode, order.shipping.city].filter(Boolean).join(' '),
        order.shipping.state,
        order.shipping.country,
      ].filter((line): line is string => Boolean(line))
    : []

  const html =
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse">` +
    `<tr><th align="left" style="padding:6px 0;border-bottom:1px solid #dfe4ea">${escapeHtml(t.item)}</th><th align="right" style="padding:6px 0;border-bottom:1px solid #dfe4ea">${escapeHtml(t.quantity)}</th><th align="right" style="padding:6px 0;border-bottom:1px solid #dfe4ea">${escapeHtml(t.total)}</th></tr>` +
    rows
      .map(
        ([title, quantity, total]) =>
          `<tr><td style="padding:6px 0">${escapeHtml(title)}</td><td align="right">${quantity}</td><td align="right">${escapeHtml(total)}</td></tr>`,
      )
      .join('') +
    `<tr><td style="padding:6px 0">${escapeHtml(t.shipping)}</td><td></td><td align="right">${escapeHtml(t.free)}</td></tr>` +
    `<tr><td style="padding:8px 0;border-top:1px solid #dfe4ea;font-weight:600">${escapeHtml(t.total)}</td><td style="border-top:1px solid #dfe4ea"></td><td align="right" style="border-top:1px solid #dfe4ea;font-weight:600">${escapeHtml(format(order.total))}</td></tr>` +
    `</table>` +
    (vat ? `<p style="margin:6px 0 0;color:#465568;font-size:12px">${escapeHtml(vat)}</p>` : '') +
    (address.length
      ? `<p style="margin:16px 0 0;font-size:14px"><strong>${escapeHtml(t.deliverTo)}</strong><br>${address.map(escapeHtml).join('<br>')}</p>`
      : '')

  const text = [
    ...rows.map(([title, quantity, total]) => `${quantity} × ${title} — ${total}`),
    `${t.shipping}: ${t.free}`,
    `${t.total}: ${format(order.total)}`,
    vat,
    '',
    address.length ? `${t.deliverTo}:\n${address.join('\n')}` : '',
  ]
    .filter((line) => line !== undefined)
    .join('\n')

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
  const transport = createTransport()

  try {
    if (order.customerEmail) {
      await transport.sendMail({
        from: emailConfig.from,
        to: order.customerEmail,
        subject: t.confirmSubject(order.number),
        text: [
          t.greeting(order.customerName ?? ''),
          '',
          t.confirmBody,
          '',
          summary.text,
          '',
          t.footer,
        ].join('\n'),
        html: wrapHtml(
          t.confirmSubject(order.number),
          `<p style="margin:0 0 12px">${escapeHtml(t.greeting(order.customerName ?? ''))}</p><p style="margin:0 0 16px">${escapeHtml(t.confirmBody)}</p>${summary.html}`,
          t.footer,
        ),
      })
    }

    const settings = await readShopSettings(payload)
    const owner = settings.notificationEmail || emailConfig.to
    if (owner) {
      const ownerText = MAIL.fr
      await transport.sendMail({
        from: emailConfig.from,
        to: owner,
        replyTo: order.customerEmail || undefined,
        subject: ownerText.ownerSubject(order.number),
        text: [
          ownerText.ownerIntro,
          '',
          orderSummary(order, 'fr').text,
          '',
          `${siteUrl}/admin/collections/orders/${order.id}`,
        ].join('\n'),
        html: wrapHtml(
          ownerText.ownerSubject(order.number),
          `<p style="margin:0 0 16px">${escapeHtml(ownerText.ownerIntro)}</p>${orderSummary(order, 'fr').html}<p style="margin:16px 0 0"><a href="${escapeHtml(`${siteUrl}/admin/collections/orders/${order.id}`)}">${escapeHtml(order.number)}</a></p>`,
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
