import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
  PayloadRequest,
} from 'payload'

import {
  adminPath,
  changedFields,
  documentTitle,
  saveAction,
  userLabel,
  type AuditAction,
} from '../../lib/audit-log'

type Entry = {
  action: AuditAction
  entity: string
  documentTitle?: string
  documentId?: string
  changedFields?: string[]
  link?: string
}

/**
 * Writes an audit entry for an action of a signed-in user. Runs outside the
 * request transaction and swallows its own errors: logging never blocks or
 * fails a save. Background jobs and visitors (no user) are not logged.
 *
 * Never awaited by the hooks: the entry references the user row, which the
 * request transaction may hold locked (sign-in, account change). Awaiting it
 * inside the hook deadlocked the request; started without waiting, the insert
 * simply completes once the transaction has committed.
 */
async function record(req: PayloadRequest, entry: Entry): Promise<void> {
  const user = req.user as {
    id: number | string
    name?: string
    email?: string
    collection?: string
  } | null
  if (!user || user.collection !== 'users' || req.context?.skipAuditLog) return
  const who = userLabel(user)
  const fields = entry.changedFields ?? []
  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: {
        summary: `${who} · ${entry.action} · ${entry.entity}${entry.documentTitle ? ` · ${entry.documentTitle}` : ''}`,
        user: user.id as number,
        userLabel: who,
        action: entry.action,
        entity: entry.entity as never,
        documentTitle: entry.documentTitle ?? '',
        documentId: entry.documentId ?? '',
        changedFields: fields.join(', '),
        locale: typeof req.locale === 'string' ? req.locale : '',
        link: entry.link ?? '',
      },
      context: { skipAuditLog: true },
    })
  } catch (error) {
    req.payload.logger.warn(
      `[audit-log] Entry not written: ${error instanceof Error ? error.message : 'unknown error'}`,
    )
  }
}

export function withAuditLog(collection: CollectionConfig): CollectionConfig {
  const titleField = collection.admin?.useAsTitle
  const adminRoute = '/admin'

  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    const action = saveAction(operation, previousDoc, doc)
    const fields = operation === 'update' ? changedFields(previousDoc, doc) : []
    // A save that changes nothing (same values, same status) is not an event.
    if (action === 'update' && fields.length === 0) return doc
    void record(req, {
      action,
      entity: collection.slug,
      documentTitle: documentTitle(doc, titleField),
      documentId: String(doc.id),
      changedFields: fields,
      link: adminPath(
        req.payload.config.routes.admin ?? adminRoute,
        'collection',
        collection.slug,
        String(doc.id),
      ),
    })
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, id, req }) => {
    void record(req, {
      action: 'delete',
      entity: collection.slug,
      documentTitle: documentTitle(doc, titleField),
      documentId: String(id),
    })
    return doc
  }

  const hooks = {
    ...collection.hooks,
    afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
    afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
  }

  if (collection.auth) {
    hooks.afterLogin = [
      ...(collection.hooks?.afterLogin ?? []),
      async ({ req, user }) => {
        void record({ ...req, user } as PayloadRequest, {
          action: 'login',
          entity: collection.slug,
          documentTitle: userLabel(user),
          documentId: String(user.id),
        })
      },
    ]
    hooks.afterLogout = [
      ...(collection.hooks?.afterLogout ?? []),
      async ({ req }) => {
        if (!req.user) return
        void record(req, {
          action: 'logout',
          entity: collection.slug,
          documentTitle: userLabel(req.user),
          documentId: String(req.user.id),
        })
      },
    ]
  }

  return { ...collection, hooks }
}

export function withGlobalAuditLog(global: GlobalConfig): GlobalConfig {
  const afterChange: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
    const fields = changedFields(previousDoc, doc)
    if (fields.length === 0) return doc
    const label = global.label
    void record(req, {
      action: 'update',
      entity: `global:${global.slug}`,
      documentTitle:
        typeof label === 'string'
          ? label
          : ((label as Record<string, string> | undefined)?.fr ?? global.slug),
      changedFields: fields,
      link: adminPath(req.payload.config.routes.admin, 'global', global.slug),
    })
    return doc
  }
  return {
    ...global,
    hooks: { ...global.hooks, afterChange: [...(global.hooks?.afterChange ?? []), afterChange] },
  }
}
