import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrSignedIn } from '../access'
import { orderField, placeholderField, seoField, slugField } from '../fields/shared'
import { GROUPS, tr } from '../i18n'

/**
 * Hybrid sales model (option C of the specification): each book declares how it
 * is sold. `direct` is modelled but intentionally NOT wired to a checkout — the
 * website never simulates a payment flow that does not exist.
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
      name: 'saleType',
      type: 'select',
      label: tr('Mode de vente', 'Verkaufsart', 'Sale type'),
      required: true,
      defaultValue: 'external',
      admin: {
        position: 'sidebar',
        description: tr(
          'Externe = lien vers un revendeur. Directe = vente sur ce site (nécessite un prestataire de paiement, non activé).',
          'Extern = Link zu einem Anbieter. Direkt = Verkauf über diese Website (Zahlungsanbieter erforderlich, nicht aktiviert).',
          'External = link to a retailer. Direct = handled on this website (requires a payment provider, not activated yet).',
        ),
      },
      options: [
        {
          label: tr('Plateforme externe', 'Externer Anbieter', 'External retailer'),
          value: 'external',
        },
        {
          label: tr(
            'Vente directe (non activée)',
            'Direktverkauf (nicht aktiviert)',
            'Direct sale (not activated)',
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
