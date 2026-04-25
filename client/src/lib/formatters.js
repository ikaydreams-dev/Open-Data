import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { DATASET_CATEGORIES, LICENSES, ROLES, MODERATION_STATUS } from './constants'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDate(value) {
    if (!value) return null
        if (value instanceof Date) return isValid(value) ? value : null
            const d = typeof value === 'string' ? parseISO(value) : new Date(value)
            return isValid(d) ? d : null
}

export function formatRelativeTime(date, suffix = true) {
    const d = toDate(date)
    if (!d) return '—'
        return formatDistanceToNow(d, { addSuffix: suffix })
}

export function formatDateShort(date) {
    const d = toDate(date)
    if (!d) return '—'
        return format(d, 'dd MMM yyyy')
}

export function formatMonthYear(date) {
    const d = toDate(date)
    if (!d) return '—'
        return format(d, 'MMM yyyy')
}

export function formatDateTime(date) {
    const d = toDate(date)
    if (!d) return '—'
        return format(d, "dd MMM yyyy 'at' HH:mm")
}

export function formatISODate(date) {
    const d = toDate(date)
    if (!d) return ''
        return format(d, 'yyyy-MM-dd')
}

// ─── Domain label converters ──────────────────────────────────────────────────

export function formatCategory(value) {
    if (!value) return '—'
        return (
            DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
        )
}

export function formatLicense(value) {
    if (!value) return '—'
        return LICENSES.find((l) => l.value === value)?.label ?? value.toUpperCase()
}

export function formatRole(role) {
    if (!role) return '—'
        const labels = {
            [ROLES.ADMIN]:       'Admin',
            [ROLES.RESEARCHER]:  'Researcher',
            [ROLES.CONTRIBUTOR]: 'Contributor',
            [ROLES.INSTITUTION]: 'Institution',
        }
        return labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1)
}

export function formatModerationStatus(status) {
    if (!status) return '—'
        const labels = {
            [MODERATION_STATUS.SUBMITTED]:    'Submitted',
            [MODERATION_STATUS.UNDER_REVIEW]: 'Under Review',
            [MODERATION_STATUS.APPROVED]:     'Approved',
            [MODERATION_STATUS.REJECTED]:     'Rejected',
        }
        return labels[status] ?? status.replace(/_/g, ' ')
}

export function formatVisibility(visibility) {
    const labels = {
        public:       'Public',
            private:      'Private',
                organization: 'Organization only',
    }
    return labels[visibility] ?? visibility ?? '—'
}

// ─── Quality score ────────────────────────────────────────────────────────────

export function formatQualityScore(score) {
    if (score == null) return { label: 'Unscored', color: 'text-stone-400' }
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { label: 'Good',      color: 'text-lime-600'  }
    if (score >= 40) return { label: 'Fair',       color: 'text-amber-600' }
    return                   { label: 'Poor',       color: 'text-red-500'   }
}

// ─── Miscellaneous ────────────────────────────────────────────────────────────

export function formatGeographicScope(countries, max = 3) {
    if (!countries?.length) return 'Global'
        if (countries.length <= max) return countries.join(', ')
            const shown = countries.slice(0, max).join(', ')
            const rest  = countries.length - max
            return `${shown} +${rest} more`
}

export function formatTemporalCoverage(coverage) {
    return coverage?.trim() || '—'
}

export function formatTags(tags) {
    if (!tags?.length) return '—'
        return tags.join(', ')
}
