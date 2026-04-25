import { StarRating } from '../shared/StarRating'

export function DatasetRatingWidget({ avgRating = null, reviewCount = 0, size = 'md' }) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  if (avgRating === null || reviewCount === 0) {
    return (
      <span className={`${textSize} text-stone-400`}>No reviews yet</span>
    )
  }

  const rounded = Math.round(Number(avgRating))

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize} text-stone-600`}>
      <StarRating value={rounded} readonly size={size === 'sm' ? 12 : 14} />
      <span className="font-medium text-stone-700">{Number(avgRating).toFixed(1)}</span>
      <span className="text-stone-400">({reviewCount})</span>
    </span>
  )
}
