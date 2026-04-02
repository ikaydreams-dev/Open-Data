import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Database } from 'lucide-react'
import { datasetsApi } from '../../api/datasets.api'
import { DatasetCard } from '../../components/datasets/DatasetCard'
import { DatasetFilters } from '../../components/datasets/DatasetFilters'
import { Pagination } from '../../components/shared/Pagination'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'likes', label: 'Most Liked' },
]

export default function DatasetBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    category: searchParams.get('category') ?? '',
    license: searchParams.get('license') ?? '',
    format: searchParams.get('format') ?? '',
    country: searchParams.get('country') ?? '',
  }
  const sort = searchParams.get('sort') ?? 'newest'
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

  function handleFilterChange(key, value) {
    setParam(key, value)
  }

  function handleSortChange(value) {
    setParam('sort', value)
  }

  function handlePageChange(newPage) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  const queryParams = { ...filters, sort, page, limit: 20 }

  const { data, isLoading } = useQuery({
    queryKey: ['datasets', queryParams],
    queryFn: () => datasetsApi.list(queryParams).then((r) => r.data),
  })

  const datasets = data?.datasets ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Browse Datasets</h1>
        {!isLoading && (
          <p className="text-sm text-stone-500 mt-1">
            {total} {total === 1 ? 'dataset' : 'datasets'} available
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <DatasetFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-stone-500 mr-1">Sort:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSortChange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  sort === opt.value
                    ? 'bg-orange-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <PageSpinner />
          ) : datasets.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No datasets found"
              description="Try adjusting your filters or search for something different."
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
    </div>
  )
}
