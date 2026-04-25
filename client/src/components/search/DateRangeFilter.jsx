import { Input } from '../shared/Input'

export function DateRangeFilter({ value = { from: '', to: '' }, onChange, className }) {
  const handleFromChange = (e) => {
    onChange({ ...value, from: e.target.value })
  }

  const handleToChange = (e) => {
    onChange({ ...value, to: e.target.value })
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        label="From Date"
        type="date"
        value={value.from}
        onChange={handleFromChange}
      />
      <Input
        label="To Date"
        type="date"
        value={value.to}
        onChange={handleToChange}
      />
    </div>
  )
}