/**
 * src/lib/formatters.js
 *
 * Domain-aware formatting utilities for the Open Data platform.
 *
 * Rule: nothing in utils.js is duplicated here. utils.js owns
 * formatNumber, formatFileSize, truncate, slugify, and cn.
 * This file owns everything date-related and all label/display
 * conversions tied to the platform's domain constants.
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { DATASET_CATEGORIES, LICENSES, ROLES, MODERATION_STATUS } from './constants'

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Parse a value into a valid Date, or return null.
 * Accepts Date objects, ISO strings, and timestamps.
 */
function toDate(value) {
    if (!value) return null
        if (value instanceof Date) return isValid(value) ? value : null
            const d = typeof value === 'string' ? parseISO(value) : new Date(value)
            return isValid(d) ? d : null
}

/**
 * Relative time string — "3 days ago", "in 2 hours".
 * Falls back to '—' for invalid dates.
 *
 * @param {Date|string|number} date
 * @param {boolean} [suffix=true]  Include "ago" / "in" wording
 * @returns {string}
 *
 * @example formatRelativeTime(dataset.updatedAt)  // "2 days ago"
 */
export function formatRelativeTime(date, suffix = true) {
    const d = toDate(date)
    if (!d) return '—'
        return formatDistanceToNow(d, { addSuffix: suffix })
}

/**
 * Short date — "15 Jan 2023"
 *
 * @param {Date|string|number} date
 * @returns {string}
 *
 * @example formatDateShort(user.createdAt)  // "03 Apr 2024"
 */
export function formatDateShort(date) {
    const d = toDate(date)
    if (!d) return '—'
        return format(d, 'dd MMM yyyy')
}

/**
 * Month + year only — "Jan 2023"
 * Used in profile "Joined" labels.
 *
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatMonthYear(date) {
    const d = toDate(date)
    if (!d) return '—'
        return format(d, 'MMM yyyy')
}

/**
 * Full date + time — "15 Jan 2023 at 14:32"
 *
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatDateTime(date) {
    const d = toDate(date)
    if (!d) return '—'
        return format(d, "dd MMM yyyy 'at' HH:mm")
}

/**
 * ISO 8601 date string for <time datetime="…"> attributes.
 *
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatISODate(date) {
    const d = toDate(date)
    if (!d) return ''
        return format(d, 'yyyy-MM-dd')
}

// ─── Domain label converters ──────────────────────────────────────────────────

/**
 * Convert a dataset category value to its human-readable label.
 *
 * @param {string} value  e.g. 'public-health'
 * @returns {string}      e.g. 'Public Health'
 *
 * @example formatCategory('public-health')  // "Public Health"
 */
export function formatCategory(value) {
    if (!value) return '—'
        return (
            DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
        )
}

/**
 * Convert a license value to its display label.
 *
 * @param {string} value  e.g. 'cc-by'
 * @returns {string}      e.g. 'CC BY 4.0'
 */
export function formatLicense(value) {
    if (!value) return '—'
        return LICENSES.find((l) => l.value === value)?.label ?? value.toUpperCase()
}

/**
 * Convert a user role value to a display label.
 *
 * @param {string} role  e.g. 'researcher'
 * @returns {string}     e.g. 'Researcher'
 */
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

/**
 * Convert a moderation status value to a display label.
 *
 * @param {string} status  e.g. 'under_review'
 * @returns {string}       e.g. 'Under Review'
 */
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

/**
 * Convert a visibility value to a display label.
 *
 * @param {'public'|'private'|'organization'} visibility
 * @returns {string}
 */
export function formatVisibility(visibility) {
    const labels = {
        public:       'Public',
            private:      'Private',
                organization: 'Organization only',
    }
    return labels[visibility] ?? visibility ?? '—'
}

// ─── Quality score ────────────────────────────────────────────────────────────

/**
 * Convert a 0–100 quality score into a human label and a Tailwind colour.
 *
 * @param {number} score
 * @returns {{ label: string, color: string }}
 *
 * @example
 * const { label, color } = formatQualityScore(dataset.qualityScore.overall)
 * // → { label: 'Good', color: 'text-green-600' }
 */
export function formatQualityScore(score) {
    if (score == null) return { label: 'Unscored', color: 'text-stone-400' }
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { label: 'Good',      color: 'text-lime-600'  }
    if (score >= 40) return { label: 'Fair',       color: 'text-amber-600' }
    return                   { label: 'Poor',       color: 'text-red-500'   }
}

// ─── Miscellaneous ────────────────────────────────────────────────────────────

/**
 * Format a geographic scope array as a readable string.
 *
 * @param {string[]} countries
 * @param {number}   [max=3]   Show at most this many names before "+N more"
 * @returns {string}
 *
 * @example formatGeographicScope(['Nigeria', 'Ghana', 'Kenya', 'Ethiopia'], 3)
 * // "Nigeria, Ghana, Kenya +1 more"
 */
export function formatGeographicScope(countries, max = 3) {
    if (!countries?.length) return 'Global'
        if (countries.length <= max) return countries.join(', ')
            const shown = countries.slice(0, max).join(', ')
            const rest  = countries.length - max
            return `${shown} +${rest} more`
}

/**
 * Format a temporal coverage string for display.
 * Passes through as-is unless empty, in which case returns '—'.
 *
 * @param {string} coverage  e.g. '2010–2023' or 'January 2020'
 * @returns {string}
 */
export function formatTemporalCoverage(coverage) {
    return coverage?.trim() || '—'
}

/**
 * Format a tag array into a comma-separated string.
 *
 * @param {string[]} tags
 * @returns {string}
 */
export function formatTags(tags) {
    if (!tags?.length) return '—'
        return tags.join(', ')
}
