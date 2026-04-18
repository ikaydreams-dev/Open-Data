import { useEffect } from 'react'
import { useSearchStore } from '../../store/searchStore'
import { SearchFilters } from '../../components/search/SearchFilters'
import { SearchResultsList } from '../../components/search/SearchResultsList'

export default function SearchResultsPage() {
  const { results, performSearch } = useSearchStore()

  // Perform initial search on mount
  useEffect(() => {
    performSearch()
  }, [performSearch])

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Search Datasets
        </h1>
        <p className="text-stone-600">
          Find and explore open data from across Africa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>

        <div className="lg:col-span-3">
          <SearchResultsList results={results} />
        </div>
      </div>
    </div>
  )
}
