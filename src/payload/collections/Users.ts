import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isAdminOrSelf } from '../access'
import { GROUPS, tr } from '../i18n'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: tr('Utilisateur', 'Benutzer', 'User'),
    plural: tr('Utilisateurs', 'Benutzer', 'Users'),
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: GROUPS.administration,
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: tr('Nom', 'Name', 'Name'),
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: tr('Rôle', 'Rolle', 'Role'),
      required: true,
      defaultValue: 'editor',
      access: { update: isAdminFieldLevel, create: isAdminFieldLevel },
      options: [
        {
          label: tr(
            'Administrateur — accès complet, gère les comptes et les réglages',
            'Administrator — Vollzugriff, verwaltet Konten und Einstellungen',
            'Administrator — full access, manages users and settings',
          ),
          value: 'admin',
        },
        {
          label: tr(
            'Éditeur / Auteur — crée et publie les contenus',
            'Redakteur / Autor — erstellt und veröffentlicht Inhalte',
            'Editor / Author — creates and publishes content',
          ),
          value: 'editor',
        },
      ],
      admin: {
        description: tr(
          'Seul un administrateur peut modifier un rôle.',
          'Nur ein Administrator kann eine Rolle ändern.',
          'Only an administrator can change a role.',
        ),
      },
    },
  ],
}
