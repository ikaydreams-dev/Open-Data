import { Link } from 'react-router-dom'
import { Download, Heart, FileText, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '../shared/Badge'
import { DatasetCategoryTag } from './DatasetCategoryTag'
import { DatasetLicenseBadge } from './DatasetLicenseBadge'
import { formatNumber, truncate } from '../../lib/utils'

function statusVariant(status) {
  return { approved: 'success', submitted: 'warning', under_review: 'info', rejected: 'danger' }[status] ?? 'default'
}

export function DatasetListItem({ dataset }) {
  const {
    title,
    slug,
    description,
    category,
    license,
    downloadCount = 0,
    likeCount = 0,
    files,
    fileCount,
    uploader,
    organization,
    updatedAt,
    moderationStatus,
  } = dataset

  const count = files?.length ?? fileCount ?? 0

  return (
    <Link
      to={`/datasets/${slug}`}
      className="flex items-start gap-4 p-4 bg-white border border-stone-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="text-sm font-semibold text-stone-900 line-clamp-1">{title}</h3>
          {moderationStatus === 'approved' && (
            <Badge variant="success" className="shrink-0 text-xs">Verified</Badge>
          )}
        </div>

        {description && (
          <p className="text-xs text-stone-500 mb-2 leading-relaxed line-clamp-2">
            {truncate(description, 130)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
          {category && <DatasetCategoryTag category={category} />}
          {license && <DatasetLicenseBadge license={license} />}
          {(uploader || organization) && (
            <span>
              by{' '}
              <span className="text-stone-600 font-medium">
                {organization?.name ?? uploader?.name}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 text-xs text-stone-400">
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
          {count}
        </span>
        {updatedAt && (
          <span className="hidden sm:flex items-center gap-1">
            <Calendar size={12} />
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </span>
        )}
      </div>
    </Link>
  )
}
