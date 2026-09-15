import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'
import { previewUrl } from '../preview'

/**
 * Hybrid sales model (option C of the specification): each book declares how it
 * is sold. `direct` uses the site cart and Stripe / PayPal (src/lib/shop.ts), and
 * only once the shop is opened and payment keys are configured — the website
 * never simulates a payment flow that does not exist.
 */
export const Books: CollectionConfig = {
  slug: 'books',
  labels: {
    singular: tr('Livre / publication', 'Buch / Publikation', 'Book / publication'),
    plural: tr('Livres et publications', 'Bücher und Publikationen', 'Books & publications'),
  },
  admin: {
    group: GROUPS.content,
    useAsTitle: 'title',
    preview: previewUrl('/books'),
    defaultColumns: ['title', 'saleType', 'availability', '_status'],
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Titre', 'Titel', 'Title'),
      required: true,
      localized: true,
    },
    slugField(),
    {
      name: 'subtitle',
      type: 'text',
      label: tr('Sous-titre', 'Untertitel', 'Subtitle'),
      localized: true,
    },
    {
      name: 'author',
      type: 'text',
      label: tr('Auteur', 'Autor', 'Author'),
      defaultValue: 'Romial Kenmogne',
      required: true,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: tr('Couverture', 'Cover', 'Cover'),
      admin: {
        description: tr('Format portrait.', 'Hochformat.', 'Portrait format.'),
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: tr('Résumé', 'Zusammenfassung', 'Summary'),
      required: true,
      localized: true,
      maxLength: 600,
    },
    {
      name: 'description',
      type: 'richText',
      label: tr('Présentation détaillée', 'Ausführliche Beschreibung', 'Detailed description'),
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'audience',
      type: 'array',
      localized: true,
      labels: {
        singular: tr('Public', 'Zielgruppe', 'Audience'),
        plural: tr('Public concerné', 'Zielgruppen', 'Target audience'),
      },
      fields: [{ name: 'item', type: 'text', label: tr('Texte', 'Text', 'Text'), required: true }],
    },
    {
      name: 'bookLanguage',
      type: 'select',
      hasMany: true,
      label: tr('Langue du livre', 'Sprache des Buchs', 'Book language'),
      options: [
        { label: tr('Anglais', 'Englisch', 'English'), value: 'en' },
        { label: tr('Français', 'Französisch', 'French'), value: 'fr' },
        { label: tr('Allemand', 'Deutsch', 'German'), value: 'de' },
      ],
      admin: {
        description: tr(
          'Langue(s) dans laquelle le livre est publié.',
          'Sprache(n), in der das Buch erschienen ist.',
          'Language(s) the book is published in.',
        ),
      },
    },
    {
      name: 'format',
      type: 'select',
      hasMany: true,
      label: tr('Format', 'Format', 'Format'),
      options: [
        { label: tr('Broché', 'Taschenbuch', 'Paperback'), value: 'paperback' },
        { label: tr('Relié', 'Gebunden', 'Hardcover'), value: 'hardcover' },
        { label: tr('E-book', 'E-Book', 'E-book'), value: 'ebook' },
        { label: tr('Livre audio', 'Hörbuch', 'Audiobook'), value: 'audiobook' },
      ],
    },
    {
      name: 'isbn',
      type: 'text',
      label: tr('ISBN', 'ISBN', 'ISBN'),
      admin: {
        description: tr(
          'ISBN-13 lorsqu’il est disponible.',
          'ISBN-13, sofern vorhanden.',
          'ISBN-13 when available.',
        ),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'publisher',
          type: 'text',
          label: tr('Éditeur', 'Verlag', 'Publisher'),
          admin: {
            description: tr(
              'Maison d’édition ou « Auto-édition ».',
              'Verlag oder „Selbstverlag“.',
              'Publishing house or "Self-published".',
            ),
          },
        },
        {
          name: 'publicationDate',
          type: 'date',
          label: tr('Date de parution', 'Erscheinungsdatum', 'Publication date'),
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
        },
        {
          name: 'pages',
          type: 'number',
          label: tr('Nombre de pages', 'Seitenzahl', 'Number of pages'),
          min: 1,
          admin: { step: 1 },
        },
      ],
    },
    {
      name: 'price',
      type: 'number',
      label: tr('Prix TTC', 'Preis inkl. MwSt.', 'Price incl. VAT'),
      min: 0,
      admin: {
        description: tr(
          'Laissez vide si le prix est fixé par le revendeur.',
          'Leer lassen, wenn der Anbieter den Preis festlegt.',
          'Leave empty when the price is set by the retailer.',
        ),
      },
    },
    {
      name: 'currency',
      type: 'select',
      label: tr('Devise', 'Währung', 'Currency'),
      defaultValue: 'EUR',
      options: [
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'USD ($)', value: 'USD' },
        { label: 'XAF (FCFA)', value: 'XAF' },
      ],
    },
    {
      name: 'availability',
      type: 'select',
      label: tr('Disponibilité', 'Verfügbarkeit', 'Availability'),
      defaultValue: 'comingSoon',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: tr('Disponible', 'Verfügbar', 'Available'), value: 'available' },
        { label: tr('Précommande', 'Vorbestellung', 'Pre-order'), value: 'preorder' },
        { label: tr('Bientôt disponible', 'Demnächst', 'Coming soon'), value: 'comingSoon' },
        { label: tr('Épuisé', 'Vergriffen', 'Out of stock'), value: 'outOfStock' },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      label: tr('Stock (vente directe)', 'Bestand (Direktverkauf)', 'Stock (direct sale)'),
      min: 0,
      admin: {
        position: 'sidebar',
        step: 1,
        condition: (data) =>
          data?.saleType === 'direct' ||
          (data?.saleType === 'external' && data?.directOrderForm === true),
        description: tr(
          'Vide = non suivi. Diminue à chaque commande payée ; à 0, le livre passe « Épuisé ».',
          'Leer = nicht verfolgt. Sinkt mit jeder bezahlten Bestellung; bei 0 wird das Buch „Vergriffen“.',
          'Empty = not tracked. Decreases with each paid order; at 0 the book becomes "Out of stock".',
        ),
      },
    },
    {
      name: 'saleType',
      type: 'select',
      label: tr('Mode de vente', 'Verkaufsart', 'Sale type'),
      required: true,
      defaultValue: 'external',
      admin: {
        position: 'sidebar',
        description: tr(
          'Externe = lien vers un revendeur. Directe = panier et paiement sur ce site (Stripe / PayPal), une fois la boutique ouverte dans Boutique → Réglages et les clés de paiement configurées ; d’ici là, le site annonce la vente directe « prochainement ».',
          'Extern = Link zu einem Anbieter. Direkt = Warenkorb und Zahlung auf dieser Website (Stripe / PayPal), sobald der Shop unter Shop → Einstellungen geöffnet und die Zahlungsschlüssel eingerichtet sind; bis dahin kündigt die Website den Direktverkauf als „demnächst“ an.',
          'External = link to a retailer. Direct = cart and payment on this website (Stripe / PayPal) once the shop is opened in Shop → Settings and the payment keys are configured; until then the site announces direct sales as "coming soon".',
        ),
      },
      options: [
        {
          label: tr('Plateforme externe', 'Externer Anbieter', 'External retailer'),
          value: 'external',
        },
        {
          label: tr(
            'Vente directe sur le site',
            'Direktverkauf auf der Website',
            'Direct sale on the website',
          ),
          value: 'direct',
        },
        {
          label: tr('Présentation seule', 'Nur Information', 'Information only'),
          value: 'none',
        },
      ],
    },
    {
      name: 'purchaseLinks',
      type: 'array',
      labels: {
        singular: tr('Lien d’achat', 'Kauflink', 'Purchase link'),
        plural: tr('Liens d’achat', 'Kauflinks', 'Purchase links'),
      },
      admin: { condition: (data) => data?.saleType === 'external' },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: tr('Libellé du bouton', 'Beschriftung', 'Button label'),
          required: true,
          localized: true,
        },
        {
          name: 'url',
          type: 'text',
          label: tr('Adresse (URL)', 'Adresse (URL)', 'URL'),
          required: true,
        },
      ],
    },
    {
      name: 'directOrderForm',
      type: 'checkbox',
      label: tr(
        'Proposer aussi l’achat direct sur le site',
        'Zusätzlich Direktkauf auf der Website anbieten',
        'Also offer direct purchase on the website',
      ),
      defaultValue: false,
      admin: {
        condition: (data) => data?.saleType === 'external',
        description: tr(
          'Sous les liens d’achat, « Commander ici » ouvre une fenêtre pour ajouter le livre au panier ; au panier, le client saisit ses coordonnées puis choisit carte ou PayPal. Il faut un prix TTC en EUR et le livre disponible ou en précommande. Le paiement n’est proposé qu’une fois la boutique ouverte et les clés de paiement configurées ; d’ici là, la fenêtre et le panier l’indiquent clairement.',
          'Unter den Kauflinks öffnet „Hier bestellen“ ein Fenster, um das Buch in den Warenkorb zu legen; im Warenkorb gibt der Kunde seine Angaben ein und wählt Karte oder PayPal. Erforderlich sind ein Bruttopreis in EUR und ein verfügbares oder vorbestellbares Buch. Die Zahlung wird erst angeboten, wenn der Shop geöffnet und die Zahlungsschlüssel eingerichtet sind; bis dahin weisen Fenster und Warenkorb deutlich darauf hin.',
          'Under the purchase links, "Order here" opens a window to add the book to the cart; in the cart the customer enters their details, then chooses card or PayPal. A gross price in EUR and an available or pre-order book are required. Payment is only offered once the shop is open and the payment keys are configured; until then the window and the cart say so clearly.',
        ),
      },
    },
    {
      name: 'previewPdf',
      type: 'upload',
      relationTo: 'documents',
      label: tr('Extrait (PDF)', 'Leseprobe (PDF)', 'Extract (PDF)'),
      admin: {
        description: tr('Facultatif.', 'Optional.', 'Optional.'),
      },
    },
    {
      name: 'relatedBooks',
      type: 'relationship',
      relationTo: 'books',
      hasMany: true,
      label: tr('Publications associées', 'Verwandte Publikationen', 'Related publications'),
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: tr('Afficher sur l’accueil', 'Auf der Startseite zeigen', 'Show on the home page'),
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    orderField,
    placeholderField,
    seoField,
  ],
}
