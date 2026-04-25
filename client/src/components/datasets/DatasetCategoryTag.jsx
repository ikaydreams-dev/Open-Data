import { DATASET_CATEGORIES } from '../../lib/constants'
import { cn } from '../../lib/utils'

export function DatasetCategoryTag({ category, className }) {
  const label = DATASET_CATEGORIES.find((c) => c.value === category)?.label ?? category

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800',
        className,
      )}
    >
      {label}
    </span>
  )
}
