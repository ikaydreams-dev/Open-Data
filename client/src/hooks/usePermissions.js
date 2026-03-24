import { useAuthStore } from '../store/authStore'
import { hasPermission, isAdmin } from '../lib/permissions'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return {
    can: (permission) => hasPermission(role, permission),
    isAdmin: isAdmin(role),
    role,
  }
}
