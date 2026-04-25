import { DatasetCard } from './DatasetCard'
import { EmptyState } from '../shared/EmptyState'
import { Database } from 'lucide-react'

export function DatasetGrid({ datasets = [], emptyTitle = 'No datasets found', emptyDescription = '' }) {
  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {datasets.map((dataset) => (
        <DatasetCard key={dataset._id ?? dataset.slug} dataset={dataset} />
      ))}
    </div>
  )
}
