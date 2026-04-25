// src/components/shared/Checkbox.jsx
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Checkbox = forwardRef(function Checkbox(
  { label, error, hint, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      <label className="inline-flex items-start gap-2 cursor-pointer group">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-stone-300 text-orange-600',
            'focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
            error && 'border-red-400 focus:ring-red-400',
            className,
          )}
          {...props}
        />
        {label && (
          <span
            className={cn(
              'text-sm text-stone-700 group-has-[:disabled]:opacity-50 group-has-[:disabled]:cursor-not-allowed',
              error && 'text-red-600',
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        )}
      </label>
      {error && <p className="text-xs text-red-600 ml-6">{error}</p>}
      {hint && !error && <p className="text-xs text-stone-500 ml-6">{hint}</p>}
    </div>
  )
})
