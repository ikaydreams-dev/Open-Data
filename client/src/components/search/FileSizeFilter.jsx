import { Input } from '../shared/Input'

export function FileSizeFilter({ value = { min: '', max: '' }, onChange, className }) {
  const handleMinChange = (e) => {
    const min = e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : 0 // Convert MB to bytes
    onChange({ ...value, min })
  }

  const handleMaxChange = (e) => {
    const max = e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : Infinity
    onChange({ ...value, max })
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        label="Min Size (MB)"
        type="number"
        placeholder="0"
        value={value.min ? (value.min / (1024 * 1024)).toString() : ''}
        onChange={handleMinChange}
        min="0"
        step="0.1"
      />
      <Input
        label="Max Size (MB)"
        type="number"
        placeholder="No limit"
        value={value.max && value.max !== Infinity ? (value.max / (1024 * 1024)).toString() : ''}
        onChange={handleMaxChange}
        min="0"
        step="0.1"
      />
    </div>
  )
}