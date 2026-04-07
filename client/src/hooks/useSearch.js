import { useState, useEffect, useCallback } from 'react'
import { searchApi } from '../api/search.api'
import { useSearchStore } from '../store/searchStore'

/**
 * Hook for fetching search results with pagination support
 * @param {string} query - The search query string
 * @param {number} page - The page number (default: 1)
 * @returns {Object} Object containing results, loading state, error, and setPage function
 */
export function useSearch(query, page = 1) {
  const { setResults } = useSearchStore()
  const [results, setLocalResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch search results from API
  const fetchSearchResults = useCallback(async () => {
    // Exit early if query is empty
    if (!query || !query.trim()) {
      setLocalResults([])
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await searchApi.search({ q: query, page })
      const data = response.data || response
      setLocalResults(data)
      setResults(data)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch search results'
      setError(errorMessage)
      setLocalResults([])
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, page, setResults])

  // Trigger fetch when query or page changes
  useEffect(() => {
    fetchSearchResults()
  }, [fetchSearchResults])

  return {
    results,
    loading,
    error,
    refetch: fetchSearchResults,
  }
}
