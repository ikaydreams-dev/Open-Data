import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Users, Database, Clock, Building2, TrendingUp,
    ArrowRight, CheckCircle, XCircle, Eye, Star,
} from 'lucide-react'
import { adminApi } from '../../api/admin.api'
import { Badge } from '../../components/shared/Badge'
import { Spinner } from '../../components/shared/Spinner'
import { formatNumber } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { DATASET_CATEGORIES } from '../../lib/constants'

function getCategoryLabel(value) {
    return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

function StatCard({ icon: Icon, label, value, sub, color = 'orange' }) {
    const colors = {
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
        blue:   'bg-blue-50 text-blue-700 border-blue-100',
        green:  'bg-green-50 text-green-700 border-green-100',
        amber:  'bg-amber-50 text-amber-700 border-amber-100',
    }
    const iconBg = {
        orange: 'bg-orange-100 text-orange-700',
        blue:   'bg-blue-100 text-blue-700',
        green:  'bg-green-100 text-green-700',
        amber:  'bg-amber-100 text-amber-700',
    }

    return (
        <div className={`rounded-xl border p-5 flex items-start gap-4 ${colors[color]}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg[color]}`}>
        <Icon size={20} />
        </div>
        <div>
        <p className="text-sm font-medium opacity-70">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
        </div>
        </div>
    )
}

function ModerationBadge({ status }) {
    const map = {
        submitted:    { label: 'Submitted',    variant: 'info' },
        under_review: { label: 'Under Review', variant: 'warning' },
        approved:     { label: 'Approved',     variant: 'success' },
        rejected:     { label: 'Rejected',     variant: 'danger' },
    }
    const { label, variant } = map[status] ?? { label: status, variant: 'default' }
    return <Badge variant={variant}>{label}</Badge>
}

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        adminApi.getDashboardStats()
        .then((res) => setData(res.data))
        .catch(() => setError('Failed to load dashboard stats.'))
        .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
            <Spinner size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-red-600 text-sm">
            {error}
            </div>
        )
    }

    const { stats, recentDatasets } = data

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Platform overview and recent activity</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
        icon={Users}
        label="Total Users"
        value={formatNumber(stats.totalUsers)}
        color="blue"
        />
        <StatCard
        icon={Database}
        label="Total Datasets"
        value={formatNumber(stats.totalDatasets)}
        color="green"
        />
        <StatCard
        icon={Clock}
        label="Pending Review"
        value={formatNumber(stats.pendingDatasets)}
        sub="Awaiting moderation"
        color="amber"
        />
        <StatCard
        icon={Building2}
        label="Organizations"
        value={formatNumber(stats.totalOrganizations)}
        color="orange"
        />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
            { label: 'Review Pending Datasets', to: '/admin?tab=moderation', icon: Clock, urgent: stats.pendingDatasets > 0 },
            { label: 'Manage Users', to: '/admin?tab=users', icon: Users, urgent: false },
            { label: 'View Analytics', to: '/admin?tab=analytics', icon: TrendingUp, urgent: false },
        ].map(({ label, to, icon: Icon, urgent }) => (
            <Link
            key={label}
            to={to}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors
                ${urgent
                    ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
                >
                <span className="flex items-center gap-2">
                <Icon size={16} />
                {label}
                {urgent && (
                    <Badge variant="warning">{stats.pendingDatasets}</Badge>
                )}
                </span>
                <ArrowRight size={14} className="shrink-0 opacity-50" />
                </Link>
        ))}
        </div>

        {/* Recent Datasets */}
        <div>
        <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-800">Recent Datasets</h2>
        <Link
        to="/admin?tab=datasets"
        className="text-sm text-orange-700 hover:underline flex items-center gap-1"
        >
        View all <ArrowRight size={13} />
        </Link>
        </div>

        <div className="rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
        <tr>
        {['Dataset', 'Category', 'Uploader', 'Status', 'Uploaded', 'Actions'].map((h) => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
            {h}
            </th>
        ))}
        </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
        {recentDatasets.map((ds) => (
            <tr key={ds._id} className="hover:bg-stone-50">
            <td className="px-4 py-3">
            <span className="font-medium text-stone-800 line-clamp-1 max-w-[180px] block">
            {ds.title}
            </span>
            </td>
            <td className="px-4 py-3 text-stone-500">
            {getCategoryLabel(ds.category)}
            </td>
            <td className="px-4 py-3 text-stone-600">
            {ds.uploader?.name ?? '—'}
            </td>
            <td className="px-4 py-3">
            <ModerationBadge status={ds.moderationStatus} />
            </td>
            <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
            {formatDistanceToNow(new Date(ds.createdAt), { addSuffix: true })}
            </td>
            <td className="px-4 py-3">
            <Link
            to={`/datasets/${ds.slug}`}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-orange-700"
            >
            <Eye size={13} /> View
            </Link>
            </td>
            </tr>
        ))}
        </tbody>
        </table>
        </div>
        </div>

        </div>
    )
}
