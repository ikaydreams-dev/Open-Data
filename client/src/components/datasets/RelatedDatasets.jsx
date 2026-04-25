import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '../../api/datasets.api'
import { DatasetCard } from './DatasetCard'
import { PageSpinner } from '../shared/Spinner'

export function RelatedDatasets({ category, currentSlug }) {
  const { data, isLoading } = useQuery({
    queryKey: ['related-datasets', category, currentSlug],
    queryFn: () =>
      datasetsApi.list({ category, limit: 5 }).then((r) => r.data),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  })

  const related = (data?.datasets ?? []).filter((d) => d.slug !== currentSlug).slice(0, 4)

  if (!category) return null
  if (isLoading) return <PageSpinner />
  if (related.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-800 mb-3">Related Datasets</h3>
      <div className="space-y-2">
        {related.map((dataset) => (
          <DatasetCard key={dataset._id} dataset={dataset} />
        ))}
      </div>
    </div>
  )
}
