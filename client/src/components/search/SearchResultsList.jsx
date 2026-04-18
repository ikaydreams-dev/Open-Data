import { SearchResultCard } from './SearchResultCard'
import { NoResultsState } from './NoResultsState'

export function SearchResultsList({ results }) {
  if (results.length === 0) {
    return <NoResultsState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((dataset) => (
        <SearchResultCard key={dataset.id} dataset={dataset} />
      ))}
    </div>
  )
}