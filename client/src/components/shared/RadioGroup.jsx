// src/components/shared/RadioGroup.jsx
import { cn } from '../../lib/utils'

// options shape: [{ value, label, description?, disabled? }]
export function RadioGroup({
  label,
  options = [],
  value,
  onChange,
  error,
  hint,
  orientation = 'vertical',
  required,
  className,
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}

      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'inline-flex items-start gap-2.5 cursor-pointer',
              option.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => !option.disabled && onChange?.(option.value)}
              disabled={option.disabled}
              className={cn(
                'mt-0.5 h-4 w-4 border-stone-300 text-orange-600',
                'focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
                'disabled:cursor-not-allowed',
                'transition-colors',
                error && 'border-red-400 focus:ring-red-400',
              )}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm text-stone-700 leading-none">{option.label}</span>
              {option.description && (
                <span className="text-xs text-stone-500">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  )
}
