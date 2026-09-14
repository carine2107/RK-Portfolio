import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

const readOnly = { readOnly: true } as const

const stampShipping: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data?.status === 'shipped' && originalDoc?.status !== 'shipped' && !data.shippedAt) {
    data.shippedAt = new Date().toISOString()
  }
  return data
}

/** E-mails the buyer when an order is marked "shipped" in the administration. */
const notifyShipping: CollectionAfterChangeHook = ({ doc, previousDoc, context, req }) => {
  if (context?.orderInternal) return doc
  if (doc?.status !== 'shipped' || previousDoc?.status === 'shipped') return doc
  import('../../lib/shop')
    .then(({ sendShippedEmail }) => sendShippedEmail(doc))
    .catch((error: unknown) =>
      req.payload.logger.error(
        `[shop] Shipping e-mail failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      ),
    )
  return doc
}

/**
 * Orders of the direct sale (printed books and digital products). Created by
 * the checkout API only; paid by a verified Stripe webhook or a PayPal
 * capture. Card data never reaches the site.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: tr('Commande', 'Bestellung', 'Order'),
    plural: tr('Commandes', 'Bestellungen', 'Orders'),
  },
  admin: {
    group: GROUPS.shop,
    useAsTitle: 'number',
    defaultColumns: ['number', 'status', 'total', 'customerEmail', 'createdAt'],
    description: tr(
      'Commandes de la vente directe. « Payée » = paiement confirmé par Stripe ou PayPal : les produits numériques sont déjà accessibles à l’acheteur ; les livres imprimés sont à expédier, puis passer le statut à « Expédiée » (e-mail à l’acheteur, avec le lien de suivi s’il est renseigné). Les remboursements se font dans Stripe ou PayPal, puis statut « Remboursée ».',
      'Bestellungen aus dem Direktverkauf. „Bezahlt“ = Zahlung von Stripe oder PayPal bestätigt: Digitale Produkte sind bereits freigeschaltet; gedruckte Bücher versenden und Status auf „Versendet“ setzen (E-Mail an den Käufer, mit Sendungslink falls angegeben). Erstattungen in Stripe oder PayPal, dann Status „Erstattet“.',
      'Direct sale orders. "Paid" = payment confirmed by Stripe or PayPal: digital products are already unlocked for the buyer; ship printed books, then set the status to "Shipped" (e-mail to the buyer, with the tracking link if filled in). Refunds are made in Stripe or PayPal, then set "Refunded".',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: { beforeChange: [stampShipping], afterChange: [notifyShipping] },
  fields: [
    {
      name: 'number',
      type: 'text',
      label: tr('Numéro', 'Nummer', 'Number'),
      required: true,
      unique: true,
      index: true,
      admin: readOnly,
    },
    {
      name: 'status',
      type: 'select',
      label: tr('Statut', 'Status', 'Status'),
      required: true,
      defaultValue: 'pending',
      options: [
        {
          value: 'pending',
          label: tr('En attente de paiement', 'Zahlung ausstehend', 'Awaiting payment'),
        },
        { value: 'paid', label: tr('Payée', 'Bezahlt', 'Paid') },
        { value: 'shipped', label: tr('Expédiée', 'Versendet', 'Shipped') },
        { value: 'cancelled', label: tr('Annulée', 'Storniert', 'Cancelled') },
        { value: 'refunded', label: tr('Remboursée', 'Erstattet', 'Refunded') },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'trackingUrl',
      type: 'text',
      label: tr('Lien de suivi du colis', 'Sendungsverfolgung (Link)', 'Tracking link'),
      admin: {
        position: 'sidebar',
        description: tr(
          'Facultatif, adresse https:// du transporteur, à renseigner avant de passer en « Expédiée ».',
          'Optional, https://-Link des Versanddienstleisters, vor „Versendet“ eintragen.',
          'Optional carrier https:// link, to fill in before setting "Shipped".',
        ),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          type: 'select',
          label: tr('Paiement', 'Zahlung', 'Payment'),
          options: [
            { value: 'stripe', label: 'Stripe' },
            { value: 'paypal', label: 'PayPal' },
          ],
          admin: readOnly,
        },
        {
          name: 'providerRef',
          type: 'text',
          label: tr('Référence prestataire', 'Anbieter-Referenz', 'Provider reference'),
          admin: readOnly,
        },
        {
          name: 'locale',
          type: 'text',
          label: tr('Langue', 'Sprache', 'Language'),
          admin: readOnly,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerName',
          type: 'text',
          label: tr('Client', 'Kunde', 'Customer'),
          admin: readOnly,
        },
        {
          name: 'customerEmail',
          type: 'email',
          label: tr('E-mail', 'E-Mail', 'E-mail'),
          admin: readOnly,
        },
      ],
    },
    {
      name: 'shipping',
      type: 'group',
      label: tr('Adresse de livraison', 'Lieferadresse', 'Delivery address'),
      admin: readOnly,
      fields: [
        { name: 'name', type: 'text', label: tr('Nom', 'Name', 'Name') },
        { name: 'line1', type: 'text', label: tr('Adresse', 'Adresse', 'Address') },
        { name: 'line2', type: 'text', label: tr('Complément', 'Adresszusatz', 'Address line 2') },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', type: 'text', label: tr('Code postal', 'PLZ', 'Postal code') },
            { name: 'city', type: 'text', label: tr('Ville', 'Stadt', 'City') },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'state',
              type: 'text',
              label: tr('Région / État', 'Region / Bundesland', 'Region / state'),
            },
            {
              name: 'country',
              type: 'text',
              label: tr('Pays (code)', 'Land (Code)', 'Country (code)'),
            },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: tr('Articles', 'Artikel', 'Items'),
      admin: readOnly,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'book',
              type: 'relationship',
              relationTo: 'books',
              label: tr('Livre imprimé', 'Gedrucktes Buch', 'Printed book'),
            },
            {
              name: 'product',
              type: 'relationship',
              relationTo: 'products',
              label: tr('Produit numérique', 'Digitales Produkt', 'Digital product'),
            },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: tr('Titre au moment de l’achat', 'Titel beim Kauf', 'Title at purchase'),
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              type: 'number',
              label: tr('Quantité', 'Menge', 'Quantity'),
              required: true,
            },
            {
              name: 'unitPrice',
              type: 'number',
              label: tr('Prix unitaire', 'Stückpreis', 'Unit price'),
              required: true,
            },
            {
              name: 'lineTotal',
              type: 'number',
              label: tr('Total ligne', 'Zeilensumme', 'Line total'),
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'total',
          type: 'number',
          label: tr('Total TTC', 'Gesamt brutto', 'Total incl. VAT'),
          required: true,
          admin: readOnly,
        },
        {
          name: 'vatRate',
          type: 'number',
          label: tr('Taux de TVA (%)', 'MwSt.-Satz (%)', 'VAT rate (%)'),
          admin: readOnly,
        },
        {
          name: 'vatAmount',
          type: 'number',
          label: tr('dont TVA', 'davon MwSt.', 'of which VAT'),
          admin: readOnly,
        },
        {
          name: 'currency',
          type: 'text',
          label: tr('Devise', 'Währung', 'Currency'),
          defaultValue: 'EUR',
          admin: readOnly,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paidAt',
          type: 'date',
          label: tr('Payée le', 'Bezahlt am', 'Paid at'),
          admin: { ...readOnly, date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'shippedAt',
          type: 'date',
          label: tr('Expédiée le', 'Versendet am', 'Shipped at'),
          admin: { ...readOnly, date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'digitalWaiverAt',
          type: 'date',
          label: tr(
            'Accès immédiat accepté le',
            'Sofortiger Zugang akzeptiert am',
            'Immediate access accepted at',
          ),
          admin: {
            ...readOnly,
            date: { pickerAppearance: 'dayAndTime' },
            description: tr(
              'Consentement à l’accès immédiat aux contenus numériques et renonciation au droit de rétractation.',
              'Zustimmung zum sofortigen Zugang zu digitalen Inhalten und Verzicht auf das Widerrufsrecht.',
              'Consent to immediate access to digital content and waiver of the right of withdrawal.',
            ),
          },
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      label: tr('Note interne', 'Interne Notiz', 'Internal note'),
    },
  ],
}
