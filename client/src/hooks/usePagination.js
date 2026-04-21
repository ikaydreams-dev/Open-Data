import { useState, useCallback } from 'react'

export function usePagination(initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage))

  // Move to the next page
  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1)
  }, [])

  // Move to the previous page (minimum 1)
  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }, [])

  // Jump to a specific page (minimum 1)
  const goToPage = useCallback((page) => {
    const pageNum = Math.max(1, Math.floor(page))
    setCurrentPage(pageNum)
  }, [])

  // Reset to initial page
  const reset = useCallback(() => {
    setCurrentPage(Math.max(1, initialPage))
  }, [initialPage])

  return {
    currentPage,
    nextPage,
    prevPage,
    goToPage,
    reset,
  }
}
