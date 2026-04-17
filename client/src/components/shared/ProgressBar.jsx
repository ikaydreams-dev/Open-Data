// src/components/shared/ProgressBar.jsx
import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-orange-600',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
}

const trackColors = {
  default: 'bg-stone-200',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  danger: 'bg-red-100',
  info: 'bg-blue-100',
}

const heights = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({
  value = 0,         // 0–100
  max = 100,
  variant = 'default',
  size = 'md',
  label,
  showValue = false,
  animated = false,
  className,
}) {
  const clamped = Math.min(100, Math.max(0, (value / max) * 100))
  const rounded = Math.round(clamped)

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-stone-700">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-medium text-stone-500 ml-auto">
              {rounded}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={cn(
          'w-full rounded-full overflow-hidden',
          trackColors[variant],
          heights[size],
        )}
      >
        {/* Fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variants[variant],
            animated && 'animate-pulse',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
