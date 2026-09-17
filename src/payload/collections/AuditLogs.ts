import type { CollectionConfig, GlobalConfig } from 'payload'

import { AUDIT_ACTIONS, type AuditAction } from '../../lib/audit-log'
import { isAdmin } from '../access'
import { GROUPS, tr } from '../i18n'

export const ACTION_LABELS: Record<AuditAction, Record<string, string>> = {
  create: tr('Création', 'Erstellt', 'Created'),
  update: tr('Modification', 'Geändert', 'Updated'),
  publish: tr('Publication', 'Veröffentlicht', 'Published'),
  unpublish: tr('Dépublication', 'Veröffentlichung aufgehoben', 'Unpublished'),
  draft: tr('Brouillon enregistré', 'Entwurf gespeichert', 'Draft saved'),
  delete: tr('Suppression', 'Gelöscht', 'Deleted'),
  login: tr('Connexion', 'Anmeldung', 'Signed in'),
  logout: tr('Déconnexion', 'Abmeldung', 'Signed out'),
}

type Labelled = { slug: string; labels?: { singular?: unknown }; label?: unknown }

const labelOf = (entity: Labelled) => {
  const label = entity.labels?.singular ?? entity.label
  return (label && typeof label === 'object' ? label : entity.slug) as
    | Record<string, string>
    | string
}

/**
 * Who did what in the administration, and when. Written only by the hooks of
 * src/payload/hooks/audit-log.ts (never through the API), readable by
 * administrators, never editable. Only field names are stored, not values.
 * Entries older than AUDIT_LOG_RETENTION_MONTHS (12 by default) are deleted by
 * the daily job.
 */
export function auditLogsCollection(
  collections: Labelled[],
  globals: Pick<GlobalConfig, 'slug' | 'label'>[],
): CollectionConfig {
  const entityOptions = [
    ...collections.map((collection) => ({ value: collection.slug, label: labelOf(collection) })),
    ...globals.map((global) => ({
      value: `global:${global.slug}`,
      label: labelOf(global as Labelled),
    })),
  ]

  return {
    slug: 'audit-logs',
    labels: {
      singular: tr('Entrée du journal', 'Protokolleintrag', 'Log entry'),
      plural: tr('Journal d’audit', 'Audit-Protokoll', 'Audit log'),
    },
    admin: {
      group: GROUPS.administration,
      useAsTitle: 'summary',
      defaultColumns: ['createdAt', 'userLabel', 'action', 'entity', 'documentTitle'],
      listSearchableFields: ['userLabel', 'documentTitle'],
      // Timeline with period tabs, filters and days (AuditLogView.tsx).
      components: {
        views: { list: { Component: '/payload/components/AuditLogView#AuditLogView' } },
      },
      description: tr(
        'Qui a créé, modifié, publié ou supprimé quoi dans l’administration, et quand ; connexions et déconnexions. Seuls les noms des champs modifiés sont notés, jamais leur contenu. Le journal ne peut pas être modifié ; les entrées de plus de 12 mois sont supprimées automatiquement.',
        'Wer in der Verwaltung was erstellt, geändert, veröffentlicht oder gelöscht hat und wann; An- und Abmeldungen. Es werden nur die Namen geänderter Felder erfasst, nie deren Inhalt. Das Protokoll ist nicht änderbar; Einträge älter als 12 Monate werden automatisch gelöscht.',
        'Who created, changed, published or deleted what in the admin, and when; sign-ins and sign-outs. Only the names of changed fields are recorded, never their content. The log cannot be edited; entries older than 12 months are deleted automatically.',
      ),
    },
    access: {
      read: isAdmin,
      create: () => false,
      update: () => false,
      delete: () => false,
    },
    timestamps: true,
    fields: [
      {
        name: 'summary',
        type: 'text',
        label: tr('Résumé', 'Zusammenfassung', 'Summary'),
        admin: { hidden: true },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'userLabel',
            type: 'text',
            label: tr('Utilisateur', 'Benutzer', 'User'),
            admin: { readOnly: true },
          },
          {
            name: 'action',
            type: 'select',
            label: tr('Action', 'Aktion', 'Action'),
            options: AUDIT_ACTIONS.map((value) => ({ value, label: ACTION_LABELS[value] })),
            index: true,
            admin: { readOnly: true },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'entity',
            type: 'select',
            label: tr('Section', 'Bereich', 'Section'),
            options: entityOptions,
            index: true,
            admin: { readOnly: true },
          },
          {
            name: 'documentTitle',
            type: 'text',
            label: tr('Élément', 'Element', 'Item'),
            admin: { readOnly: true },
          },
        ],
      },
      {
        name: 'changedFields',
        type: 'text',
        label: tr('Champs modifiés', 'Geänderte Felder', 'Changed fields'),
        admin: {
          readOnly: true,
          description: tr(
            'Noms techniques des champs, sans leur contenu.',
            'Technische Feldnamen, ohne Inhalt.',
            'Technical field names, without their content.',
          ),
        },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'documentId',
            type: 'text',
            label: tr('Identifiant', 'Kennung', 'ID'),
            admin: { readOnly: true },
          },
          {
            name: 'locale',
            type: 'text',
            label: tr('Langue du contenu', 'Inhaltssprache', 'Content language'),
            admin: { readOnly: true },
          },
          {
            name: 'link',
            type: 'text',
            label: tr('Lien', 'Link', 'Link'),
            admin: { readOnly: true },
          },
        ],
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: 'users',
        label: tr('Compte', 'Konto', 'Account'),
        admin: { readOnly: true, position: 'sidebar' },
      },
    ],
  }
}
