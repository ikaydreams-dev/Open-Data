import { Search } from 'lucide-react'

export function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-12 w-12 text-stone-400 mb-4" />
      <h3 className="text-lg font-medium text-stone-900 mb-2">
        No results found
      </h3>
      <p className="text-stone-600 max-w-md">
        Try adjusting your search query or filters to find what you're looking for.
      </p>
    </div>
  )
}