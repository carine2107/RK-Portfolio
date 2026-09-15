import type { GlobalConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

/**
 * Direct sale settings. The shop opens only when it is enabled here AND the
 * payment keys (Stripe and/or PayPal) are configured on the server.
 */
export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: tr('Réglages de la boutique', 'Shop-Einstellungen', 'Shop settings'),
  admin: {
    group: GROUPS.shop,
    description: tr(
      'Vente directe des livres. Les paiements passent par Stripe (carte, Apple Pay, Google Pay…) et PayPal ; leurs clés sont configurées sur le serveur par le prestataire technique. Tant qu’elles manquent, le site n’affiche aucun paiement, même si la boutique est activée.',
      'Direktverkauf der Bücher. Zahlungen über Stripe (Karte, Apple Pay, Google Pay …) und PayPal; die Schlüssel werden auf dem Server eingerichtet. Solange sie fehlen, zeigt die Website keine Zahlung an, auch wenn der Shop aktiviert ist.',
      'Direct book sales. Payments go through Stripe (card, Apple Pay, Google Pay…) and PayPal; their keys are configured on the server. While they are missing the site shows no payment, even if the shop is enabled.',
    ),
  },
  access: { read: isAdminOrEditor, update: isAdmin },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: tr('Ouvrir la vente directe', 'Direktverkauf öffnen', 'Open direct sales'),
      defaultValue: false,
      admin: {
        description: tr(
          'Permet le paiement en ligne des livres en « Vente directe » et des livres proposant « Commander ici » (prix en EUR, disponibles ou en précommande). Les boutons de paiement n’apparaissent au panier qu’une fois les clés Stripe ou PayPal configurées. À cocher seulement après validation des conditions générales de vente et de la politique de retours.',
          'Ermöglicht die Online-Zahlung für Bücher im „Direktverkauf“ und für Bücher mit „Hier bestellen“ (Preis in EUR, verfügbar oder vorbestellbar). Die Zahlungsschaltflächen erscheinen im Warenkorb erst, wenn die Stripe- oder PayPal-Schlüssel eingerichtet sind. Erst nach Freigabe der AGB und der Rückgabebedingungen aktivieren.',
          'Enables online payment for books set to "Direct sale" and books offering "Order here" (EUR price, available or pre-order). Payment buttons only appear in the cart once the Stripe or PayPal keys are configured. Tick only once the terms of sale and the returns policy are validated.',
        ),
      },
    },
    {
      name: 'vatRate',
      type: 'number',
      label: tr(
        'TVA incluse dans les prix (%)',
        'In den Preisen enthaltene MwSt. (%)',
        'VAT included in prices (%)',
      ),
      defaultValue: 0,
      min: 0,
      max: 30,
      admin: {
        step: 0.1,
        description: tr(
          'À faire valider par le comptable. 0 = aucune TVA indiquée (par exemple régime Kleinunternehmer) ; 7 = taux réduit allemand des livres. Les prix saisis sur les livres sont toujours TTC.',
          'Vom Steuerberater bestätigen lassen. 0 = keine MwSt. ausgewiesen (z. B. Kleinunternehmer); 7 = ermäßigter Satz für Bücher. Die Buchpreise sind immer Bruttopreise.',
          'To be confirmed by the accountant. 0 = no VAT shown (e.g. small business scheme); 7 = German reduced rate for books. Book prices are always gross prices.',
        ),
      },
    },
    {
      name: 'notificationEmail',
      type: 'email',
      label: tr(
        'Notification des commandes',
        'Benachrichtigung bei Bestellungen',
        'Order notifications',
      ),
      admin: {
        description: tr(
          'Adresse qui reçoit chaque nouvelle commande payée. À défaut, la variable EMAIL_TO est utilisée.',
          'Adresse für jede neue bezahlte Bestellung. Andernfalls wird EMAIL_TO verwendet.',
          'Address receiving each new paid order. Falls back to EMAIL_TO.',
        ),
      },
    },
  ],
}
