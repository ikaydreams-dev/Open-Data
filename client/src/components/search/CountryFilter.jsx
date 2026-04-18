import { Select } from '../shared/Select'
import { AFRICAN_COUNTRIES } from '../../lib/constants'

export function CountryFilter({ value, onChange, className }) {
  const options = [
    { value: '', label: 'All Countries' },
    ...AFRICAN_COUNTRIES.map(country => ({ value: country, label: country }))
  ]

  return (
    <Select
      label="Country"
      placeholder="Select country"
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  )
}