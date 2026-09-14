import type { Access, FieldAccess } from 'payload'

type UserRole = 'admin' | 'editor'

type MaybeUser = { role?: UserRole | null } | null | undefined

const hasRole = (user: MaybeUser, ...roles: UserRole[]) =>
  Boolean(user?.role && roles.includes(user.role))

/** Anyone may read published documents; authenticated staff may read drafts too. */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (hasRole(user as MaybeUser, 'admin', 'editor')) return true
  return {
    _status: {
      equals: 'published',
    },
  }
}

/** Documents without draft support: public read. */
export const anyone: Access = () => true

export const isSignedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user as MaybeUser, 'admin')

export const isAdminOrEditor: Access = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'admin', 'editor')

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'admin')

/** Field readable by staff only: protected content never leaves through the public API. */
export const isStaffFieldLevel: FieldAccess = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'admin', 'editor')

/** Administrators manage every account; an editor may only read/update itself. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (hasRole(user as MaybeUser, 'admin')) return true
  if (!user) return false
  return { id: { equals: user.id } }
}
