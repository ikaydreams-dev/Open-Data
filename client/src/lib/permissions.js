import { ROLES } from './constants'

export const PERMISSIONS = {
  UPLOAD_DATASET: [ROLES.ADMIN, ROLES.RESEARCHER, ROLES.CONTRIBUTOR, ROLES.INSTITUTION],
  EDIT_ANY_DATASET: [ROLES.ADMIN],
  DELETE_ANY_DATASET: [ROLES.ADMIN],
  MODERATE_CONTENT: [ROLES.ADMIN],
  VIEW_ADMIN_DASHBOARD: [ROLES.ADMIN],
  CREATE_ORGANIZATION: [ROLES.ADMIN, ROLES.INSTITUTION],
}

export function hasPermission(userRole, permission) {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(userRole)
}

export function isAdmin(role) {
  return role === ROLES.ADMIN
}
