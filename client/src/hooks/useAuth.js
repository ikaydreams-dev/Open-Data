import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth.api'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    // On mount, try to rehydrate session from refresh token cookie
    const rehydrate = async () => {
      try {
        const { data } = await authApi.refresh()
        setAuth(data.user, data.accessToken)
      } catch {
        clearAuth()
      }
    }
    rehydrate()
  }, [])

  return { user, isAuthenticated, isLoading }
}
