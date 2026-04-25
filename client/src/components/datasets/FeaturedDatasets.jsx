import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { datasetsApi } from '../../api/datasets.api'
import { DatasetCard } from './DatasetCard'
import { PageSpinner } from '../shared/Spinner'

export function FeaturedDatasets() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-datasets'],
    queryFn: () => datasetsApi.list({ featured: true, limit: 6 }).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  })

  const datasets = data?.datasets ?? []

  if (isLoading) return <PageSpinner />
  if (datasets.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Featured Datasets</h2>
        <Link to="/datasets" className="text-sm text-orange-700 hover:underline">
          Browse all →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {datasets.map((dataset) => (
          <div key={dataset._id} className="snap-start shrink-0 w-72">
            <DatasetCard dataset={dataset} />
          </div>
        ))}
      </div>
    </section>
  )
}
