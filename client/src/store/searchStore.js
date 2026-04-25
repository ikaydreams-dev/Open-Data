import { create } from 'zustand'
import { MOCK_DATASETS } from '../lib/constants'

/**
 * Global search state store using Zustand
 * Manages search query, filters, and results across the application
 * Follows the same pattern as authStore and uiStore
 */
export const useSearchStore = create((set, get) => ({
  // State
  query: '',
  results: [],
  filters: {
    category: '',
    country: '',
    license: '',
    fileSizeMin: 0,
    fileSizeMax: Infinity,
    dateFrom: '',
    dateTo: '',
  },

  // Actions
  /**
   * Update the search query
   * @param {string} query - The new search query
   */
  setQuery: (query) => set({ query }),

  /**
   * Update the search results
   * @param {Array} results - The new results array
   */
  setResults: (results) => set({ results: Array.isArray(results) ? results : [] }),

  /**
   * Update search filters
   * @param {Object} newFilters - Partial filters object to merge
   */
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  /**
   * Clear all filters
   */
  clearFilters: () => set({
    filters: {
      category: '',
      country: '',
      license: '',
      fileSizeMin: 0,
      fileSizeMax: Infinity,
      dateFrom: '',
      dateTo: '',
    }
  }),

  /**
   * Perform search with current query and filters using mock data
   */
  performSearch: () => {
    const { query, filters } = get()
    let filteredResults = MOCK_DATASETS

    // Filter by query (title or description)
    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredResults = filteredResults.filter(dataset =>
        dataset.title.toLowerCase().includes(lowerQuery) ||
        dataset.description.toLowerCase().includes(lowerQuery) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    }

    // Apply filters
    if (filters.category) {
      filteredResults = filteredResults.filter(dataset => dataset.category === filters.category)
    }
    if (filters.country) {
      filteredResults = filteredResults.filter(dataset => dataset.country === filters.country)
    }
    if (filters.license) {
      filteredResults = filteredResults.filter(dataset => dataset.license === filters.license)
    }
    if (filters.fileSizeMin > 0) {
      filteredResults = filteredResults.filter(dataset => dataset.fileSize >= filters.fileSizeMin)
    }
    if (filters.fileSizeMax < Infinity) {
      filteredResults = filteredResults.filter(dataset => dataset.fileSize <= filters.fileSizeMax)
    }
    if (filters.dateFrom) {
      filteredResults = filteredResults.filter(dataset => dataset.createdAt >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filteredResults = filteredResults.filter(dataset => dataset.createdAt <= filters.dateTo)
    }

    set({ results: filteredResults })
  },

  /**
   * Clear both query and results
   */
  clearSearch: () => set({ query: '', results: [] }),

  /**
   * Update both query and results at once
   * @param {string} query - The new search query
   * @param {Array} results - The new results array
   */
  updateSearch: (query, results) =>
    set({
      query,
      results: Array.isArray(results) ? results : [],
    }),
}))
