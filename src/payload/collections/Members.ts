import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, isStaffFieldLevel } from '../access'
import { GROUPS, tr } from '../i18n'

/**
 * Buyers' member accounts. Created automatically at the first digital
 * purchase (or by an administrator to grant access by hand). No password:
 * members sign in with a single-use link sent by e-mail.
 */
export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: tr('Membre', 'Mitglied', 'Member'),
    plural: tr('Membres', 'Mitglieder', 'Members'),
  },
  admin: {
    group: GROUPS.shop,
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'locale', 'lastLoginAt', 'createdAt'],
    description: tr(
      'Comptes des acheteurs de produits numériques, créés à leur premier achat. Pas de mot de passe : connexion par lien e-mail. Pour supprimer un compte sur demande, supprimer aussi ses accès.',
      'Konten der Käufer digitaler Produkte, beim ersten Kauf angelegt. Kein Passwort: Anmeldung per E-Mail-Link. Bei Löschung auf Wunsch auch die Zugänge löschen.',
      'Accounts of digital product buyers, created at their first purchase. No password: sign-in by e-mail link. When deleting an account on request, delete its accesses too.',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: tr('E-mail', 'E-Mail', 'E-mail'),
      required: true,
      unique: true,
      index: true,
    },
    { name: 'name', type: 'text', label: tr('Nom', 'Name', 'Name') },
    {
      name: 'locale',
      type: 'select',
      label: tr('Langue des e-mails', 'Sprache der E-Mails', 'E-mail language'),
      required: true,
      defaultValue: 'en',
      options: [
        { value: 'fr', label: tr('Français', 'Französisch', 'French') },
        { value: 'de', label: tr('Allemand', 'Deutsch', 'German') },
        { value: 'en', label: tr('Anglais', 'Englisch', 'English') },
      ],
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      label: tr('Dernière connexion', 'Letzte Anmeldung', 'Last sign-in'),
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      // Rotated at every link and sign-in: a login link works only once.
      name: 'loginNonce',
      type: 'text',
      access: { read: isStaffFieldLevel, update: () => false },
      admin: { hidden: true },
    },
  ],
}
