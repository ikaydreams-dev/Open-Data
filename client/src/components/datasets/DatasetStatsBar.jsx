import { Download, Heart, FileText } from 'lucide-react'
import { StarRating } from '../shared/StarRating'
import { formatNumber } from '../../lib/utils'

export function DatasetStatsBar({ downloadCount = 0, likeCount = 0, fileCount = 0, avgRating = null, reviewCount = 0 }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
      <span className="flex items-center gap-1.5">
        <Download size={15} />
        {formatNumber(downloadCount)} downloads
      </span>

      <span className="flex items-center gap-1.5">
        <Heart size={15} />
        {formatNumber(likeCount)}
      </span>

      <span className="flex items-center gap-1.5">
        <FileText size={15} />
        {fileCount} {fileCount === 1 ? 'file' : 'files'}
      </span>

      {avgRating !== null && (
        <span className="flex items-center gap-1.5">
          <StarRating value={Math.round(Number(avgRating))} readonly />
          <span className="text-stone-600 font-medium">{Number(avgRating).toFixed(1)}</span>
          <span className="text-stone-400">({reviewCount})</span>
        </span>
      )}
    </div>
  )
}
