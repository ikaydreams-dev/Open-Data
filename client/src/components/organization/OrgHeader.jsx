import { Link } from 'react-router-dom'
import { Building2, Globe, Users, Database, BadgeCheck, Pencil } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import { formatNumber } from '../../lib/utils'
import { cn } from '../../lib/utils'

const TYPE_LABEL = {
  university:         'University',
  government:         'Government Agency',
  ngo:                'NGO / Non-Profit',
  company:            'Company',
  research_institute: 'Research Institute',
  other:              'Organization',
}

export function OrgHeader({ org, canEdit = false, className }) {
  if (!org) return null

  const {
    name,
    slug,
    description,
    type,
    logo,
    website,
    country,
    location,
    verified,
    datasetCount = 0,
    memberCount  = 0,
    members      = [],
  } = org

  // Derive memberCount from embedded members array if not returned directly
  const resolvedMemberCount = memberCount || members.length

  return (
    <div className={cn('flex flex-col sm:flex-row items-start gap-5', className)}>
      {/* Logo */}
      <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 overflow-hidden border border-stone-100">
        {logo?.url ? (
          <img src={logo.url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Building2 size={28} className="text-orange-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name + badges */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-stone-900">{name}</h1>
          {verified && (
            <span title="Verified organization">
              <BadgeCheck size={18} className="text-blue-500" />
            </span>
          )}
          {type && (
            <Badge variant="default">
              {TYPE_LABEL[type] ?? type}
            </Badge>
          )}
        </div>

        {/* Location */}
        {(location || country) && (
          <p className="text-xs text-stone-400 mb-2">
            {[location, country].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-stone-500 mb-3 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-stone-500">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-stone-400" />
            <span className="font-semibold text-stone-800">
              {formatNumber(resolvedMemberCount)}
            </span>{' '}
            member{resolvedMemberCount !== 1 ? 's' : ''}
          </span>

          <span className="flex items-center gap-1.5">
            <Database size={14} className="text-stone-400" />
            <span className="font-semibold text-stone-800">
              {formatNumber(datasetCount)}
            </span>{' '}
            dataset{datasetCount !== 1 ? 's' : ''}
          </span>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-orange-700 hover:underline"
            >
              <Globe size={14} />
              {website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* Edit button */}
      {canEdit && (
        <Link to={`/organizations/${slug}/edit`} className="shrink-0">
          <Button variant="outline" size="sm">
            <Pencil size={14} />
            Edit
          </Button>
        </Link>
      )}
    </div>
  )
}
