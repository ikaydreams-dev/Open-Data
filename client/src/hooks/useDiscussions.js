import { useState, useEffect, useCallback } from 'react'
import { communityApi } from '../api/community.api'

/**
 * Hook for fetching discussions from the community API
 * @param {Object} params - Optional query parameters (e.g., { limit: 10, page: 1 })
 * @returns {Object} Object containing discussions array, loading state, error, and refetch function
 */
export function useDiscussions(params = {}) {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch discussions from API
  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await communityApi.listDiscussions(params)
      // Handle both direct data and nested response.data patterns
      const data = response.data || response
      setDiscussions(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch discussions'
      setError(errorMessage)
      setDiscussions([])
    } finally {
      setLoading(false)
    }
  }, [params])

  // Trigger fetch when params change
  useEffect(() => {
    fetchDiscussions()
  }, [fetchDiscussions])

  return {
    discussions,
    loading,
    error,
    refetch: fetchDiscussions,
  }
}
