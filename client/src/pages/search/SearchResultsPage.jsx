import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SearchX } from 'lucide-react'
import { searchApi } from '../../api/search.api'
import { DatasetCard } from '../../components/datasets/DatasetCard'
import { DatasetFilters } from '../../components/datasets/DatasetFilters'
import { Pagination } from '../../components/shared/Pagination'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '')

  // Keep input in sync if URL changes externally (e.g. Navbar search)
  useEffect(() => {
    setInputValue(searchParams.get('q') ?? '')
  }, [searchParams])

  const filters = {
    category: searchParams.get('category') ?? '',
    license: searchParams.get('license') ?? '',
    format: searchParams.get('format') ?? '',
    country: searchParams.get('country') ?? '',
  }
  const q = searchParams.get('q') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.set('page', '1')
      return next
    })
  }

  function handleSearch(e) {
    e.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (inputValue.trim()) {
        next.set('q', inputValue.trim())
      } else {
        next.delete('q')
      }
      next.set('page', '1')
      return next
    })
  }

  function handlePageChange(newPage) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  const queryParams = { q, ...filters, page, limit: 20 }

  const { data, isLoading } = useQuery({
    queryKey: ['search', queryParams],
    queryFn: () => searchApi.search(queryParams).then((r) => r.data),
    enabled: !!q,
  })

  const datasets = data?.datasets ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search datasets…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-700 text-white text-sm font-medium rounded-lg hover:bg-orange-800 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {!q ? (
        <EmptyState
          icon={Search}
          title="Search for datasets"
          description="Enter a keyword above to find datasets across all categories."
        />
      ) : (
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-56 shrink-0">
            <DatasetFilters filters={filters} onChange={(key, value) => setParam(key, value)} />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {!isLoading && (
              <p className="text-sm text-stone-500 mb-5">
                <span className="font-semibold text-stone-800">{total}</span>{' '}
                {total === 1 ? 'result' : 'results'} for{' '}
                <span className="font-semibold text-stone-800">"{q}"</span>
              </p>
            )}

            {isLoading ? (
              <PageSpinner />
            ) : datasets.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No results found"
                description={`Nothing matched "${q}". Try different keywords or adjust your filters.`}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {datasets.map((dataset) => (
                    <DatasetCard key={dataset._id ?? dataset.slug} dataset={dataset} />
                  ))}
                </div>

                <div className="flex justify-center">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
