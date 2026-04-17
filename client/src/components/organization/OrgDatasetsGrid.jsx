import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Database, Upload } from 'lucide-react'
import { datasetsApi } from '../../api/datasets.api'
import { DatasetCard } from '../datasets/DatasetCard'
import { Pagination } from '../shared/Pagination'
import { EmptyState } from '../shared/EmptyState'
import { PageSpinner } from '../shared/Spinner'
import { cn } from '../../lib/utils'

/**
 * OrgDatasetsGrid — paginated grid of datasets belonging to an organisation.
 *
 * Fetches its own data using the org slug so it can be dropped into any page
 * that has the slug available, without the parent managing dataset state.
 *
 * Props:
 *   orgSlug     {string}   Organization slug used to filter datasets
 *   canUpload   {boolean}  Show an "Upload Dataset" CTA when the grid is empty
 *   pageSize    {number}   Datasets per page (default: 12)
 *   className   {string}
 */
export function OrgDatasetsGrid({ orgSlug, canUpload = false, pageSize = 12, className }) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['org-datasets', orgSlug, page, pageSize],
    queryFn: () =>
      datasetsApi
        .list({ organization: orgSlug, page, limit: pageSize })
        .then((r) => r.data),
    enabled: !!orgSlug,
    keepPreviousData: true,
  })

  const datasets   = data?.datasets   ?? []
  const totalPages = data?.totalPages ?? 1
  const total      = data?.total      ?? 0

  if (isLoading) return <PageSpinner />

  if (isError) {
    return (
      <p className="text-sm text-red-500 py-8 text-center">
        Failed to load datasets. Please try again.
      </p>
    )
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No datasets yet"
        description="This organization hasn't published any datasets."
        className={className}
        action={
          canUpload ? (
            <Link
              to="/datasets/upload"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-700 text-white text-sm font-medium rounded-md hover:bg-orange-800 transition-colors"
            >
              <Upload size={14} /> Upload a Dataset
            </Link>
          ) : null
        }
      />
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Result count */}
      <p className="text-sm text-stone-500">
        {total} dataset{total !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {datasets.map((dataset) => (
          <DatasetCard key={dataset._id ?? dataset.slug} dataset={dataset} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
