import { Select } from '../shared/Select'
import { LICENSES } from '../../lib/constants'

export function LicenseFilter({ value, onChange, className }) {
  const options = [
    { value: '', label: 'All Licenses' },
    ...LICENSES
  ]

  return (
    <Select
      label="License"
      placeholder="Select license"
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  )
}