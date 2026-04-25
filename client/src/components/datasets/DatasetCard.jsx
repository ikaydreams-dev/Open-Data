import { Link } from 'react-router-dom'
import { Download, Heart, FileText, Calendar } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { formatNumber, truncate } from '../../lib/utils'
import { DATASET_CATEGORIES } from '../../lib/constants'
import { formatDistanceToNow } from 'date-fns'

function getCategoryLabel(value) {
  return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export function DatasetCard({ dataset }) {
  const {
    title,
    slug,
    description,
    category,
    license,
    downloadCount = 0,
    likeCount = 0,
    fileCount = 0,
    uploader,
    organization,
    updatedAt,
    moderationStatus,
  } = dataset

  return (
    <Link
      to={`/datasets/${slug}`}
      className="block bg-white border border-stone-200 rounded-lg p-5 hover:border-orange-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 flex-1">
          {title}
        </h3>
        {moderationStatus === 'approved' && (
          <Badge variant="success" className="shrink-0">Verified</Badge>
        )}
      </div>

      {description && (
        <p className="text-xs text-stone-500 mb-3 leading-relaxed">
          {truncate(description, 110)}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {category && (
          <Badge variant="primary">{getCategoryLabel(category)}</Badge>
        )}
        {license && (
          <Badge variant="default">{license.toUpperCase()}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Download size={12} />
            {formatNumber(downloadCount)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {formatNumber(likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <FileText size={12} />
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </span>
        </div>

        {updatedAt && (
          <span className="flex items-center gap-1 shrink-0">
            <Calendar size={12} />
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </span>
        )}
      </div>

      {(uploader || organization) && (
        <div className="mt-2 pt-2 border-t border-stone-100 text-xs text-stone-400">
          {organization
            ? <>by <span className="text-stone-600 font-medium">{organization.name}</span></>
            : <>by <span className="text-stone-600 font-medium">{uploader.name}</span></>}
        </div>
      )}
    </Link>
  )
}
