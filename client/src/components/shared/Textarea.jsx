import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, rows = 4, ...props },
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
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm text-stone-900',
          'placeholder:text-stone-400 bg-white resize-y',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
          error ? 'border-red-400' : 'border-stone-300',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  )
})
