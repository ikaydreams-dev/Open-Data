import { Link } from 'react-router-dom'
import { Upload, Heart, MessageSquare, Star, Database } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { EmptyState } from '../shared/EmptyState'
import { Spinner } from '../shared/Spinner'
import { formatRelativeTime } from '../../lib/formatters'
import { formatCategory } from '../../lib/formatters'
import { cn } from '../../lib/utils'

export function UserActivityFeed({ datasets = [], isLoading, isOwnProfile, className }) {
  // Convert datasets to activity items
  const activities = datasets.map((ds) => ({
    id:        ds._id ?? ds.slug,
    type:      'upload',
    title:     ds.title,
    slug:      ds.slug,
    category:  ds.category,
    timestamp: ds.createdAt,
    meta: {
      status: ds.moderationStatus,
    },
  }))

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No activity yet"
        description={
          isOwnProfile
            ? "You haven't uploaded any datasets yet."
            : "This user hasn't published any datasets yet."
        }
        className={className}
      />
    )
  }

  return (
    <ol className={cn('relative border-l border-stone-200 ml-3 space-y-6', className)}>
      {activities.map((item) => (
        <ActivityItem key={item.id} activity={item} />
      ))}
    </ol>
  )
}

// ── Activity item ──────────────────────────────────────────────────────────────

const ACTIVITY_META = {
  upload:  { icon: Upload,      label: 'Uploaded a dataset',  color: 'bg-orange-100 text-orange-700' },
  like:    { icon: Heart,       label: 'Liked a dataset',     color: 'bg-red-100 text-red-600'    },
  comment: { icon: MessageSquare, label: 'Commented',          color: 'bg-blue-100 text-blue-600'  },
  review:  { icon: Star,        label: 'Reviewed a dataset',  color: 'bg-amber-100 text-amber-600' },
}

const STATUS_VARIANT = {
  approved:     'success',
  submitted:    'warning',
  under_review: 'info',
  rejected:     'danger',
}

const STATUS_LABEL = {
  approved:     'Approved',
  submitted:    'Submitted',
  under_review: 'Under Review',
  rejected:     'Rejected',
}

function ActivityItem({ activity }) {
  const { icon: Icon, label, color } = ACTIVITY_META[activity.type] ?? ACTIVITY_META.upload

  return (
    <li className="ml-5">
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute -left-2.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0',
          color,
        )}
      >
        <Icon size={11} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-stone-400 mb-0.5">{label}</p>
          <Link
            to={`/datasets/${activity.slug}`}
            className="text-sm font-medium text-stone-800 hover:text-orange-700 transition-colors line-clamp-1"
          >
            {activity.title}
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {activity.category && (
              <span className="text-xs text-stone-400">
                {formatCategory(activity.category)}
              </span>
            )}
            {activity.meta?.status && (
              <Badge variant={STATUS_VARIANT[activity.meta.status] ?? 'default'} className="text-[10px] px-1.5">
                {STATUS_LABEL[activity.meta.status] ?? activity.meta.status}
              </Badge>
            )}
          </div>
        </div>

        <time
          dateTime={activity.timestamp}
          className="text-xs text-stone-400 whitespace-nowrap shrink-0 mt-0.5"
        >
          {formatRelativeTime(activity.timestamp)}
        </time>
      </div>
    </li>
  )
}
