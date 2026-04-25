import { Select } from '../shared/Select'
import { DATASET_CATEGORIES } from '../../lib/constants'

export function CategoryFilter({ value, onChange, className }) {
  const options = [
    { value: '', label: 'All Categories' },
    ...DATASET_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }))
  ]

  return (
    <Select
      label="Category"
      placeholder="Select category"
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  )
}