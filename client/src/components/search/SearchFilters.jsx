import { useSearchStore } from '../../store/searchStore'
import { CategoryFilter } from './CategoryFilter'
import { CountryFilter } from './CountryFilter'
import { LicenseFilter } from './LicenseFilter'
import { FileSizeFilter } from './FileSizeFilter'
import { DateRangeFilter } from './DateRangeFilter'
import { FilterChip } from './FilterChip'
import { Button } from '../shared/Button'

export function SearchFilters() {
  const { filters, setFilters, performSearch, clearFilters } = useSearchStore()

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value })
  }

  const handleFileSizeChange = (value) => {
    setFilters({
      fileSizeMin: value.min,
      fileSizeMax: value.max,
    })
  }

  const handleDateRangeChange = (value) => {
    setFilters({
      dateFrom: value.from,
      dateTo: value.to,
    })
  }

  const handleRemoveFilter = (key) => {
    if (key === 'fileSize') {
      setFilters({ fileSizeMin: 0, fileSizeMax: Infinity })
    } else if (key === 'dateRange') {
      setFilters({ dateFrom: '', dateTo: '' })
    } else {
      setFilters({ [key]: '' })
    }
  }

  const handleSearch = () => {
    performSearch()
  }

  const handleClearAll = () => {
    clearFilters()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-900">Filters</h3>
        <Button variant="outline" size="sm" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>

      <FilterChip filters={filters} onRemove={handleRemoveFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <CategoryFilter
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
        />
        <CountryFilter
          value={filters.country}
          onChange={(value) => handleFilterChange('country', value)}
        />
        <LicenseFilter
          value={filters.license}
          onChange={(value) => handleFilterChange('license', value)}
        />
        <FileSizeFilter
          value={{ min: filters.fileSizeMin, max: filters.fileSizeMax }}
          onChange={handleFileSizeChange}
        />
        <DateRangeFilter
          value={{ from: filters.dateFrom, to: filters.dateTo }}
          onChange={handleDateRangeChange}
        />
      </div>

      <Button onClick={handleSearch} className="w-full">
        Apply Filters & Search
      </Button>
    </div>
  )
}