import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function RoleGuard({ children, allowedRoles }) {
  const user = useAuthStore((s) => s.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }
  return children
}
