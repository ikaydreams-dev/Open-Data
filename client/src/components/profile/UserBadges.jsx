import { ShieldCheck } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { formatRole } from '../../lib/formatters'
import { cn } from '../../lib/utils'

/**
 * Role → Badge variant mapping, consistent with OrgMembers, admin pages, etc.
 */
const ROLE_VARIANT = {
  admin:       'danger',
  researcher:  'primary',
  contributor: 'info',
  institution: 'warning',
}


export function UserBadges({ user, showVerified = false, className }) {
  if (!user) return null

  return (
    <div className={cn('flex items-center flex-wrap gap-1.5', className)}>
      {/* Role */}
      {user.role && (
        <Badge variant={ROLE_VARIANT[user.role] ?? 'default'} className="capitalize">
          {formatRole(user.role)}
        </Badge>
      )}

      {/* Email verified indicator */}
      {showVerified && user.emailVerified && (
        <Badge variant="success" className="flex items-center gap-1">
          <ShieldCheck size={11} />
          Verified
        </Badge>
      )}
    </div>
  )
}

/**
 * RoleBadge — standalone role badge, used where just the role is needed.
 */
export function RoleBadge({ role, className }) {
  if (!role) return null
  return (
    <Badge variant={ROLE_VARIANT[role] ?? 'default'} className={cn('capitalize', className)}>
      {formatRole(role)}
    </Badge>
  )
}
