import { Link } from 'react-router-dom'
import { Building2, Database, Users, Globe, BadgeCheck } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { formatNumber } from '../../lib/utils'
import { cn } from '../../lib/utils'

/**
 * Org type → display label
 */
const TYPE_LABEL = {
  university:        'University',
  government:        'Government',
  ngo:               'NGO',
  company:           'Company',
  research_institute:'Research Institute',
  other:             'Organization',
}

/**
 * OrgCard — organisation listing card, analogous to DatasetCard.
 *
 * Props:
 *   org       {object}   Organization object from the API
 *   className {string}
 */
export function OrgCard({ org, className }) {
  const {
    name,
    slug,
    description,
    type,
    logo,
    website,
    datasetCount = 0,
    memberCount  = 0,
    verified     = false,
    country,
  } = org

  return (
    <Link
      to={`/organizations/${slug}`}
      className={cn(
        'block bg-white border border-stone-200 rounded-xl p-5',
        'hover:border-orange-300 hover:shadow-sm transition-all',
        className,
      )}
    >
      {/* Logo + name row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
          {logo?.url ? (
            <img
              src={logo.url}
              alt={name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Building2 size={20} className="text-orange-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-stone-900 truncate">
              {name}
            </span>
            {verified && (
              <BadgeCheck size={14} className="text-blue-500 shrink-0" />
            )}
          </div>
          <span className="text-xs text-stone-400">
            {TYPE_LABEL[type] ?? 'Organization'}
            {country ? ` · ${country}` : ''}
          </span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-3">
          {description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-stone-400 pt-3 border-t border-stone-100">
        <span className="flex items-center gap-1">
          <Database size={12} />
          <span className="font-semibold text-stone-600">{formatNumber(datasetCount)}</span>
          {' '}dataset{datasetCount !== 1 ? 's' : ''}
        </span>

        {memberCount > 0 && (
          <span className="flex items-center gap-1">
            <Users size={12} />
            <span className="font-semibold text-stone-600">{formatNumber(memberCount)}</span>
            {' '}member{memberCount !== 1 ? 's' : ''}
          </span>
        )}

        {website && (
          <span className="ml-auto flex items-center gap-1 text-orange-700 truncate">
            <Globe size={11} />
            <span className="truncate max-w-[100px]">
              {website.replace(/^https?:\/\//, '')}
            </span>
          </span>
        )}
      </div>
    </Link>
  )
}
