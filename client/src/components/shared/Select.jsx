import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm text-stone-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
          'disabled:bg-stone-50 disabled:cursor-not-allowed',
          error ? 'border-red-400' : 'border-stone-300',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
