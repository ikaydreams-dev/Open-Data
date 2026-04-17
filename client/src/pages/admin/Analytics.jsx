import { useEffect, useState } from 'react'
import {
    TrendingUp, Download, Heart, Database,
    Users, BarChart2, Award, Globe,
} from 'lucide-react'
import { adminApi } from '../../api/admin.api'
import { datasetsApi } from '../../api/datasets.api'
import { Spinner } from '../../components/shared/Spinner'
import { Badge } from '../../components/shared/Badge'
import { formatNumber } from '../../lib/utils'
import { DATASET_CATEGORIES } from '../../lib/constants'
import { Link } from 'react-router-dom'

function getCategoryLabel(value) {
    return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

// Simple horizontal bar chart
function BarChart({ items, valueKey = 'count', labelKey = 'label', color = 'bg-orange-500' }) {
    const max = Math.max(...items.map((i) => i[valueKey]), 1)
    return (
        <div className="space-y-2">
        {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-stone-500 w-36 shrink-0 truncate text-right">
            {item[labelKey]}
            </span>
            <div className="flex-1 h-5 bg-stone-100 rounded overflow-hidden">
            <div
            className={`h-full rounded transition-all duration-500 ${color}`}
            style={{ width: `${(item[valueKey] / max) * 100}%` }}
            />
            </div>
            <span className="text-xs font-semibold text-stone-700 w-10 shrink-0">
            {formatNumber(item[valueKey])}
            </span>
            </div>
        ))}
        </div>
    )
}

function MetricCard({ icon: Icon, label, value, sub, highlight = false }) {
    return (
        <div className={`rounded-xl border p-5 flex flex-col gap-3 ${highlight ? 'border-orange-200 bg-orange-50' : 'border-stone-200 bg-white'}`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${highlight ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-500'}`}>
        <Icon size={18} />
        </div>
        <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${highlight ? 'text-orange-700' : 'text-stone-900'}`}>
        {value ?? '—'}
        </p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
        </div>
        </div>
    )
}

export default function Analytics() {
    const [stats, setStats]           = useState(null)
    const [topDatasets, setTopDatasets] = useState([])
    const [categoryBreakdown, setCategoryBreakdown] = useState([])
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        async function load() {
            try {
                // 1) Admin dashboard stats
                const statsRes = await adminApi.getDashboardStats()
                setStats(statsRes.data.stats)

                // 2) Top datasets by downloads
                const topRes = await datasetsApi.list({ sort: 'downloads', limit: 10 })
                setTopDatasets(topRes.data.datasets ?? [])

                // 3) Category breakdown — fetch a broader sample and aggregate
                const allRes = await datasetsApi.list({ limit: 100 })
                const byCategory = {}
                ;(allRes.data.datasets ?? []).forEach((ds) => {
                    if (!byCategory[ds.category]) byCategory[ds.category] = { count: 0, downloads: 0, likes: 0 }
                    byCategory[ds.category].count++
                    byCategory[ds.category].downloads += ds.downloadCount ?? 0
                    byCategory[ds.category].likes += ds.likeCount ?? 0
                })
                const breakdown = Object.entries(byCategory)
                .map(([category, v]) => ({ label: getCategoryLabel(category), ...v }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 12)
                setCategoryBreakdown(breakdown)
            } catch {
                // Fail silently — partial data is fine
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
            <Spinner size="lg" />
            </div>
        )
    }

    const totalDownloads = topDatasets.reduce((s, d) => s + (d.downloadCount ?? 0), 0)
    const totalLikes     = topDatasets.reduce((s, d) => s + (d.likeCount ?? 0), 0)
    const approvalRate   = stats?.totalDatasets
    ? Math.round(((stats.totalDatasets - stats.pendingDatasets) / stats.totalDatasets) * 100)
    : null

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
        <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
        <p className="text-sm text-stone-500 mt-1">Platform-wide metrics and trends</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
        icon={Users}
        label="Total Users"
        value={formatNumber(stats?.totalUsers)}
        highlight
        />
        <MetricCard
        icon={Database}
        label="Total Datasets"
        value={formatNumber(stats?.totalDatasets)}
        />
        <MetricCard
        icon={Download}
        label="Total Downloads"
        value={formatNumber(totalDownloads)}
        sub="from top 10 datasets"
        />
        <MetricCard
        icon={Award}
        label="Approval Rate"
        value={approvalRate != null ? `${approvalRate}%` : '—'}
        sub="datasets published"
        />
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Datasets by Downloads */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
        <TrendingUp size={15} className="text-orange-600" />
        Top Datasets by Downloads
        </h2>
        </div>
        {topDatasets.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">No data yet</p>
        ) : (
            <div className="space-y-2">
            {topDatasets.slice(0, 8).map((ds, idx) => (
                <div key={ds._id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-xs text-stone-400 font-mono text-right shrink-0">
                {idx + 1}
                </span>
                <Link
                to={`/datasets/${ds.slug}`}
                className="flex-1 min-w-0 text-stone-700 hover:text-orange-700 truncate font-medium"
                >
                {ds.title}
                </Link>
                <div className="flex items-center gap-1.5 shrink-0">
                <Download size={12} className="text-stone-400" />
                <span className="text-xs font-semibold text-stone-600">
                {formatNumber(ds.downloadCount ?? 0)}
                </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                <Heart size={12} className="text-stone-400" />
                <span className="text-xs text-stone-500">
                {formatNumber(ds.likeCount ?? 0)}
                </span>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
        <BarChart2 size={15} className="text-orange-600" />
        Dataset Distribution by Category
        </h2>
        {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">No data yet</p>
        ) : (
            <BarChart
            items={categoryBreakdown}
            valueKey="count"
            labelKey="label"
            color="bg-orange-500"
            />
        )}
        </div>
        </div>

        {/* Downloads by Category */}
        {categoryBreakdown.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
            <Globe size={15} className="text-orange-600" />
            Downloads by Category
            </h2>
            <BarChart
            items={[...categoryBreakdown].sort((a, b) => b.downloads - a.downloads)}
            valueKey="downloads"
            labelKey="label"
            color="bg-blue-500"
            />
            </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-2">Pending Review</p>
        <p className="text-3xl font-bold text-amber-600">{formatNumber(stats?.pendingDatasets ?? 0)}</p>
        <p className="text-xs text-stone-500 mt-1">datasets in the queue</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-2">Total Likes</p>
        <p className="text-3xl font-bold text-red-500">{formatNumber(totalLikes)}</p>
        <p className="text-xs text-stone-500 mt-1">across top datasets</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-2">Organizations</p>
        <p className="text-3xl font-bold text-green-600">{formatNumber(stats?.totalOrganizations ?? 0)}</p>
        <p className="text-xs text-stone-500 mt-1">registered on platform</p>
        </div>
        </div>

        </div>
    )
}
