import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

const stampGrant: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && !data.grantedAt) data.grantedAt = new Date().toISOString()
  return data
}

/**
 * Access of a member to a digital product. Created when an order is paid;
 * an administrator can also grant or remove an access by hand. For courses it
 * also holds the member's progress (ids of completed lessons).
 */
export const Entitlements: CollectionConfig = {
  slug: 'entitlements',
  labels: {
    singular: tr('Accès', 'Zugang', 'Access'),
    plural: tr('Accès aux produits', 'Produktzugänge', 'Product accesses'),
  },
  admin: {
    group: GROUPS.shop,
    defaultColumns: ['member', 'product', 'grantedAt', 'downloads'],
    description: tr(
      'Qui a accès à quel produit numérique. Créé automatiquement au paiement ; un administrateur peut aussi en ajouter (geste commercial) ou en retirer.',
      'Wer Zugang zu welchem digitalen Produkt hat. Automatisch bei Zahlung angelegt; Administratoren können Zugänge hinzufügen oder entfernen.',
      'Who can access which digital product. Created automatically on payment; an administrator can also add or remove one.',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: { beforeChange: [stampGrant] },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      label: tr('Membre', 'Mitglied', 'Member'),
      required: true,
      index: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: tr('Produit', 'Produkt', 'Product'),
      required: true,
      index: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: tr('Commande', 'Bestellung', 'Order'),
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'grantedAt',
          type: 'date',
          label: tr('Accordé le', 'Gewährt am', 'Granted at'),
          admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'downloads',
          type: 'number',
          label: tr('Téléchargements', 'Downloads', 'Downloads'),
          defaultValue: 0,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'completedLessons',
      type: 'json',
      label: tr('Leçons terminées', 'Abgeschlossene Lektionen', 'Completed lessons'),
      admin: { readOnly: true, hidden: true },
    },
  ],
}
