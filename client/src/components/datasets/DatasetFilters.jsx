import { X } from 'lucide-react'
import { DATASET_CATEGORIES, LICENSES, FILE_FORMATS, AFRICAN_COUNTRIES } from '../../lib/constants'

const formatOptions = FILE_FORMATS.map((f) => ({ value: f.toLowerCase(), label: f }))
const countryOptions = AFRICAN_COUNTRIES.map((c) => ({ value: c, label: c }))

const selectClass =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500'

export function DatasetFilters({ filters = {}, onChange }) {
  const hasActiveFilters = Object.values(filters).some(Boolean)

  function handleClear() {
    onChange('category', '')
    onChange('license', '')
    onChange('format', '')
    onChange('country', '')
  }

  return (
    <aside className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-800">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      <FilterGroup label="Category">
        <select
          value={filters.category ?? ''}
          onChange={(e) => onChange('category', e.target.value)}
          className={selectClass}
        >
          <option value="">All categories</option>
          {DATASET_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="License">
        <select
          value={filters.license ?? ''}
          onChange={(e) => onChange('license', e.target.value)}
          className={selectClass}
        >
          <option value="">All licenses</option>
          {LICENSES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="File Format">
        <select
          value={filters.format ?? ''}
          onChange={(e) => onChange('format', e.target.value)}
          className={selectClass}
        >
          <option value="">All formats</option>
          {formatOptions.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Country">
        <select
          value={filters.country ?? ''}
          onChange={(e) => onChange('country', e.target.value)}
          className={selectClass}
        >
          <option value="">All countries</option>
          {countryOptions.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </FilterGroup>
    </aside>
  )
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-stone-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}
