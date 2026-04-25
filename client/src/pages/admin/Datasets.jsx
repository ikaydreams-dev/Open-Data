import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
    Database, Search, Eye, Star, StarOff, Trash2, ExternalLink,
} from 'lucide-react'
import { adminApi } from '../../api/admin.api'
import { datasetsApi } from '../../api/datasets.api'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Spinner } from '../../components/shared/Spinner'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { Pagination } from '../../components/shared/Pagination'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatNumber, truncate } from '../../lib/utils'
import { DATASET_CATEGORIES, MODERATION_STATUS } from '../../lib/constants'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

function getCategoryLabel(value) {
    return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

const STATUS_META = {
    submitted:    { label: 'Submitted',    variant: 'info' },
    under_review: { label: 'Under Review', variant: 'warning' },
    approved:     { label: 'Approved',     variant: 'success' },
    rejected:     { label: 'Rejected',     variant: 'danger' },
}

function StatusBadge({ status }) {
    const { label, variant } = STATUS_META[status] ?? { label: status, variant: 'default' }
    return <Badge variant={variant}>{label}</Badge>
}

const CATEGORY_OPTIONS = DATASET_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))
const STATUS_OPTIONS = Object.entries(MODERATION_STATUS).map(([, v]) => ({
    value: v,
    label: STATUS_META[v]?.label ?? v,
}))

export default function Datasets() {
    const [datasets, setDatasets]     = useState([])
    const [total, setTotal]           = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage]             = useState(1)
    const [loading, setLoading]       = useState(true)
    const [search, setSearch]         = useState('')
    const [categoryFilter, setCategory] = useState('')
    const [statusFilter, setStatus]   = useState('')

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting]         = useState(false)

    const fetchDatasets = useCallback(() => {
        setLoading(true)
        // Use the public list endpoint (admin can see all via uploader param logic)
        // We pass no visibility filter so we get everything, filtering client-side by status
        datasetsApi.list({
            page,
            limit: 20,
            category: categoryFilter || undefined,
        })
        .then((res) => {
            let items = res.data.datasets
            if (statusFilter) items = items.filter((d) => d.moderationStatus === statusFilter)
                if (search.trim()) {
                    const q = search.toLowerCase()
                    items = items.filter(
                        (d) =>
                        d.title.toLowerCase().includes(q) ||
                        d.uploader?.name?.toLowerCase().includes(q)
                    )
                }
                setDatasets(items)
                setTotal(res.data.total)
                setTotalPages(res.data.totalPages)
        })
        .catch(() => toast.error('Failed to load datasets'))
        .finally(() => setLoading(false))
    }, [page, categoryFilter, statusFilter, search])

    useEffect(() => { fetchDatasets() }, [fetchDatasets])

    async function handleFeatureToggle(dataset) {
        const newVal = !dataset.featured
        try {
            await adminApi.featureDataset(dataset.slug, newVal)
            toast.success(newVal ? 'Dataset featured' : 'Removed from featured')
            setDatasets((prev) =>
            prev.map((d) => d.slug === dataset.slug ? { ...d, featured: newVal } : d)
            )
        } catch {
            toast.error('Failed to update feature status')
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
            setDeleting(true)
            try {
                await datasetsApi.delete(deleteTarget.slug)
                toast.success('Dataset deleted')
                setDatasets((prev) => prev.filter((d) => d.slug !== deleteTarget.slug))
                setDeleteTarget(null)
            } catch {
                toast.error('Failed to delete dataset')
            } finally {
                setDeleting(false)
            }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
        <h1 className="text-2xl font-bold text-stone-900">Datasets</h1>
        <p className="text-sm text-stone-500 mt-0.5">
        {formatNumber(total)} total datasets
        </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
        type="text"
        placeholder="Search title or uploader…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        />
        </div>
        <select
        value={categoryFilter}
        onChange={(e) => { setCategory(e.target.value); setPage(1) }}
        className="px-3 py-2 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-700"
        >
        <option value="">All categories</option>
        {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        </select>
        <select
        value={statusFilter}
        onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        className="px-3 py-2 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-700"
        >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        </select>
        </div>

        {/* Table */}
        {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : datasets.length === 0 ? (
            <EmptyState icon={Database} title="No datasets found" description="Try adjusting your filters." />
        ) : (
            <>
            <div className="rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
            {['Title', 'Category', 'Uploader', 'Status', 'Downloads', 'Uploaded', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                {h}
                </th>
            ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
            {datasets.map((ds) => (
                <tr key={ds._id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                {ds.featured && (
                    <Star size={12} className="text-amber-500 shrink-0" fill="currentColor" />
                )}
                <span className="font-medium text-stone-800 max-w-[180px] truncate block">
                {ds.title}
                </span>
                </div>
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">
                {getCategoryLabel(ds.category)}
                </td>
                <td className="px-4 py-3 text-stone-600 text-xs">
                {ds.uploader?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                <StatusBadge status={ds.moderationStatus} />
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs">
                {formatNumber(ds.downloadCount ?? 0)}
                </td>
                <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(ds.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                <Link
                to={`/datasets/${ds.slug}`}
                className="text-stone-400 hover:text-orange-700"
                title="View dataset"
                >
                <ExternalLink size={14} />
                </Link>
                <button
                onClick={() => handleFeatureToggle(ds)}
                className={ds.featured
                    ? 'text-amber-500 hover:text-stone-400'
            : 'text-stone-300 hover:text-amber-500'}
            title={ds.featured ? 'Remove from featured' : 'Feature this dataset'}
            >
            {ds.featured ? <Star size={14} fill="currentColor" /> : <Star size={14} />}
            </button>
            <button
            onClick={() => setDeleteTarget(ds)}
            className="text-stone-300 hover:text-red-600"
            title="Delete dataset"
            >
            <Trash2 size={14} />
            </button>
            </div>
            </td>
            </tr>
            ))}
            </tbody>
            </table>
            </div>

            <div className="flex justify-center mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            </>
        )}

        {/* Delete Confirm */}
        <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Dataset"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
        />

        </div>
    )
}
