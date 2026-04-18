import { X } from 'lucide-react'
import { Button } from '../shared/Button'
import { Badge } from '../shared/Badge'

export function FilterChip({ filters, onRemove }) {
  const activeFilters = []

  if (filters.category) {
    activeFilters.push({
      key: 'category',
      label: `Category: ${filters.category}`,
    })
  }

  if (filters.country) {
    activeFilters.push({
      key: 'country',
      label: `Country: ${filters.country}`,
    })
  }

  if (filters.license) {
    activeFilters.push({
      key: 'license',
      label: `License: ${filters.license}`,
    })
  }

  if (filters.fileSizeMin > 0 || (filters.fileSizeMax && filters.fileSizeMax < Infinity)) {
    const minMB = filters.fileSizeMin > 0 ? (filters.fileSizeMin / (1024 * 1024)).toFixed(1) : null
    const maxMB = filters.fileSizeMax < Infinity ? (filters.fileSizeMax / (1024 * 1024)).toFixed(1) : null
    let label = 'File Size: '
    if (minMB && maxMB) {
      label += `${minMB}-${maxMB}MB`
    } else if (minMB) {
      label += `>${minMB}MB`
    } else if (maxMB) {
      label += `<${maxMB}MB`
    }
    activeFilters.push({
      key: 'fileSize',
      label,
    })
  }

  if (filters.dateFrom || filters.dateTo) {
    let label = 'Date: '
    if (filters.dateFrom && filters.dateTo) {
      label += `${filters.dateFrom} to ${filters.dateTo}`
    } else if (filters.dateFrom) {
      label += `From ${filters.dateFrom}`
    } else if (filters.dateTo) {
      label += `To ${filters.dateTo}`
    }
    activeFilters.push({
      key: 'dateRange',
      label,
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
          {filter.label}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(filter.key)}
            className="h-4 w-4 p-0 hover:bg-stone-200"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}