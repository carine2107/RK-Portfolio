/**
 * Audit log of the administration (pure helpers, unit-tested): which user
 * created, changed, published or deleted what, and when. Only field names are
 * recorded, never their values, so the log holds no copy of personal data or
 * content. Hooks: src/payload/hooks/audit-log.ts.
 */

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'publish',
  'unpublish',
  'draft',
  'delete',
  'login',
  'logout',
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

type Doc = Record<string, unknown> | null | undefined

/** Bookkeeping fields that change on every save and say nothing about the edit. */
const IGNORED_FIELDS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  '_status',
  'history',
  'followUpReminderSentAt',
  'loginAttempts',
  'lockUntil',
  'sessions',
  'resetPasswordToken',
  'resetPasswordExpiration',
  'salt',
  'hash',
])

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/** Top-level fields whose value differs between the two versions, sorted. */
export function changedFields(previous: Doc, next: Doc): string[] {
  if (!next) return []
  const keys = new Set([...Object.keys(previous ?? {}), ...Object.keys(next)])
  return [...keys]
    .filter((key) => !IGNORED_FIELDS.has(key) && !same(previous?.[key], next[key]))
    .sort()
}

/** What a save did, seen from the site: creation, publication, draft or plain change. */
export function saveAction(operation: 'create' | 'update', previous: Doc, next: Doc): AuditAction {
  const status = next?._status
  const before = previous?._status
  if (operation === 'create') return status === 'draft' ? 'draft' : 'create'
  if (status === 'published' && before !== 'published') return 'publish'
  if (status === 'draft' && before === 'published' && previous) {
    // Unpublishing saves the document itself as a draft; a draft of a
    // published page is stored as a separate version and leaves _status alone.
    return 'unpublish'
  }
  if (status === 'draft') return 'draft'
  return 'update'
}

/** Readable title of a document at the time of the action. */
export function documentTitle(doc: Doc, titleField?: string): string {
  if (!doc) return ''
  const candidates = [titleField, 'title', 'name', 'subject', 'email', 'number', 'filename']
  for (const field of candidates) {
    const value = field ? doc[field] : undefined
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 200)
    if (typeof value === 'number') return String(value)
  }
  return doc.id !== undefined ? `#${String(doc.id)}` : ''
}

export function userLabel(user: { name?: unknown; email?: unknown } | null | undefined): string {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''
  const email = typeof user?.email === 'string' ? user.email.trim() : ''
  if (name && email) return `${name} (${email})`
  return name || email
}

/** Admin screen of the document the entry is about, when it still exists. */
export function adminPath(
  adminRoute: string,
  entity: 'collection' | 'global',
  slug: string,
  id?: string | null,
) {
  if (entity === 'global') return `${adminRoute}/globals/${slug}`
  return id ? `${adminRoute}/collections/${slug}/${id}` : `${adminRoute}/collections/${slug}`
}
