import { Link } from 'react-router-dom'
import { UserMinus } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { EmptyState } from '../shared/EmptyState'
import { Spinner } from '../shared/Spinner'
import { UserAvatar } from '../profile/UserAvatar'
import { formatDateShort } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import { Users } from 'lucide-react'

/**
 * Platform role → badge variant (same map used across the codebase)
 */
const PLATFORM_ROLE_VARIANT = {
  admin:       'danger',
  researcher:  'primary',
  contributor: 'info',
  institution: 'warning',
}

/**
 * Org-level role → badge variant
 */
const ORG_ROLE_VARIANT = {
  owner:  'danger',
  admin:  'warning',
  member: 'default',
}

/**
 * OrgMemberList — renders the member list for an organisation.
 *
 * Props:
 *   members        {Array}    Member objects: { _id, name, username, avatar, role, orgRole, joinedAt }
 *   isLoading      {boolean}
 *   canManage      {boolean}  Show remove buttons
 *   currentUserId  {string}   Prevent user from removing themselves
 *   onRemove       {function(member)}  Called when the remove button is clicked
 *   className      {string}
 */
export function OrgMemberList({
  members = [],
  isLoading,
  canManage = false,
  currentUserId,
  onRemove,
  className,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members yet"
        description="This organization has no members."
        className={className}
      />
    )
  }

  return (
    <ul className={cn('divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden', className)}>
      {members.map((member) => {
        const isSelf = member._id === currentUserId
        return (
          <li
            key={member._id}
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-stone-50 transition-colors"
          >
            {/* Avatar */}
            <UserAvatar user={member} size={34} />

            {/* Name + username */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/users/${member.username}`}
                className="text-sm font-medium text-stone-800 hover:text-orange-700 transition-colors block truncate"
              >
                {member.name}
              </Link>
              <p className="text-xs text-stone-400">@{member.username}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {/* Org role */}
              {member.orgRole && (
                <Badge
                  variant={ORG_ROLE_VARIANT[member.orgRole] ?? 'default'}
                  className="capitalize"
                >
                  {member.orgRole}
                </Badge>
              )}
              {/* Platform role */}
              {member.role && (
                <Badge
                  variant={PLATFORM_ROLE_VARIANT[member.role] ?? 'default'}
                  className="capitalize hidden sm:inline-flex"
                >
                  {member.role}
                </Badge>
              )}
            </div>

            {/* Joined date */}
            {member.joinedAt && (
              <span className="text-xs text-stone-400 shrink-0 hidden md:block">
                {formatDateShort(member.joinedAt)}
              </span>
            )}

            {/* Remove button */}
            {canManage && !isSelf && (
              <button
                onClick={() => onRemove?.(member)}
                className="p-1.5 rounded-md text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                title={`Remove ${member.name}`}
              >
                <UserMinus size={15} />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
