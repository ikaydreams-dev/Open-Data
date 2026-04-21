import { Database, Download, Calendar, MapPin, Link as LinkIcon, Building2 } from 'lucide-react'
import { formatNumber } from '../../lib/utils'
import { formatMonthYear } from '../../lib/formatters'
import { cn } from '../../lib/utils'

/**
 * UserStatsPanel — shows a user's key numeric and metadata stats.
 *
 * Props:
 *   user        {object}   User / profile object from the API
 *   stats       {object}   Optional separate stats object { datasetCount, totalDownloads }
 *                          Falls back to user.datasetCount / user.totalDownloads if not given.
 *   orientation {'row'|'col'}  Layout direction (default: 'row')
 *   className   {string}
 */
export function UserStatsPanel({ user, stats, orientation = 'row', className }) {
  if (!user) return null

  const datasetCount   = stats?.datasetCount   ?? user.datasetCount   ?? 0
  const totalDownloads = stats?.totalDownloads ?? user.totalDownloads ?? 0

  const isRow = orientation === 'row'

  return (
    <div
      className={cn(
        'flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500',
        !isRow && 'flex-col gap-y-2',
        className,
      )}
    >
      {/* Dataset count */}
      <Stat icon={Database}>
        <span className="font-semibold text-stone-800">{formatNumber(datasetCount)}</span>
        {' '}dataset{datasetCount !== 1 ? 's' : ''}
      </Stat>

      {/* Total downloads */}
      <Stat icon={Download}>
        <span className="font-semibold text-stone-800">{formatNumber(totalDownloads)}</span>
        {' '}download{totalDownloads !== 1 ? 's' : ''}
      </Stat>

      {/* Joined date */}
      {user.createdAt && (
        <Stat icon={Calendar}>
          Joined {formatMonthYear(user.createdAt)}
        </Stat>
      )}

      {/* Location */}
      {user.location && (
        <Stat icon={MapPin}>
          {user.location}
        </Stat>
      )}

      {/* Affiliation */}
      {user.affiliation && (
        <Stat icon={Building2}>
          {user.affiliation}
        </Stat>
      )}

      {/* Website */}
      {user.website && (
        <Stat icon={LinkIcon}>
          <a
            href={user.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-700 hover:underline truncate max-w-[200px]"
          >
            {user.website.replace(/^https?:\/\//, '')}
          </a>
        </Stat>
      )}
    </div>
  )
}

function Stat({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      <Icon size={14} className="text-stone-400 shrink-0" />
      {children}
    </span>
  )
}
