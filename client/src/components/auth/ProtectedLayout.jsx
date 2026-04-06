import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { PageSpinner } from '../shared/Spinner'

export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/sign-in" state={{ from: location }} replace />
  return <Outlet />
}
