import { create } from 'zustand'

/**
 * Global search state store using Zustand
 * Manages search query and results across the application
 * Follows the same pattern as authStore and uiStore
 */
export const useSearchStore = create((set) => ({
  // State
  query: '',
  results: [],

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
