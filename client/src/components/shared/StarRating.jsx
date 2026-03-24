import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

export function StarRating({ value = 0, max = 5, onChange, readonly = false }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'focus:outline-none',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform',
          )}
        >
          <Star
            size={16}
            className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}
          />
        </button>
      ))}
    </div>
  )
}
