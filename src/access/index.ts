import type { Access, FieldAccess, PayloadRequest } from 'payload'

/** Single role today; stored as an array so more roles can be added later. */
export type Role = 'admin'

type MaybeUser = { roles?: (Role | string)[] | null } | null | undefined

export const isAdminUser = (user: MaybeUser): boolean =>
  Boolean(user && Array.isArray(user.roles) && user.roles.includes('admin'))

export const isAdmin: Access = ({ req }) => isAdminUser(req.user as MaybeUser)

export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req.user as MaybeUser)

/** Default deny for public: nobody but admins. */
export const adminOnly = {
  create: isAdmin,
  read: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}

/** For collections with drafts (versions): public may read published documents only. */
export const publishedOrAdmin: Access = ({ req }) => {
  if (isAdminUser(req.user as MaybeUser)) return true
  return { _status: { equals: 'published' } }
}

/** For collections with an `isPublished` checkbox: public may read published documents only. */
export const isPublishedOrAdmin: Access = ({ req }) => {
  if (isAdminUser(req.user as MaybeUser)) return true
  return { isPublished: { equals: true } }
}

export const anyone: Access = () => true

export const hasAdmin = (req: PayloadRequest) => isAdminUser(req.user as MaybeUser)
