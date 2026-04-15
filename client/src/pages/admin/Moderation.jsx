import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
    Clock, CheckCircle2, XCircle, ExternalLink,
    FileText, Download, Calendar, User, Building2,
} from 'lucide-react'
import { adminApi } from '../../api/admin.api'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Spinner } from '../../components/shared/Spinner'
import { Modal } from '../../components/shared/Modal'
import { Pagination } from '../../components/shared/Pagination'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatNumber, truncate } from '../../lib/utils'
import { DATASET_CATEGORIES } from '../../lib/constants'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

function getCategoryLabel(value) {
    return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

function DatasetMeta({ label, value, icon: Icon }) {
    if (!value) return null
        return (
            <div className="flex items-start gap-2">
            <Icon size={13} className="text-stone-400 mt-0.5 shrink-0" />
            <div>
            <span className="text-xs text-stone-400">{label}: </span>
            <span className="text-xs text-stone-700">{value}</span>
            </div>
            </div>
        )
}

export default function Moderation() {
    const [datasets, setDatasets]     = useState([])
    const [total, setTotal]           = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage]             = useState(1)
    const [loading, setLoading]       = useState(true)

    // Reject modal
    const [rejectTarget, setRejectTarget] = useState(null)
    const [rejectNote, setRejectNote]     = useState('')
    const [acting, setActing]             = useState(false)

    // Expanded dataset row
    const [expanded, setExpanded] = useState(null)

    const fetchPending = useCallback(() => {
        setLoading(true)
        adminApi.getPendingDatasets({ page, limit: 10 })
        .then((res) => {
            setDatasets(res.data.datasets)
            setTotal(res.data.total)
            setTotalPages(res.data.totalPages)
        })
        .catch(() => toast.error('Failed to load pending datasets'))
        .finally(() => setLoading(false))
    }, [page])

    useEffect(() => { fetchPending() }, [fetchPending])

    async function moderate(slug, status, note = '') {
        setActing(true)
        try {
            await adminApi.moderateDataset(slug, { status, note })
            toast.success(`Dataset ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'moved to review'}`)
            setDatasets((prev) => prev.filter((d) => d.slug !== slug))
            setTotal((t) => Math.max(0, t - 1))
            setRejectTarget(null)
            setRejectNote('')
        } catch {
            toast.error('Failed to update status')
        } finally {
            setActing(false)
        }
    }

    function openReject(dataset) {
        setRejectTarget(dataset)
        setRejectNote('')
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
        <div>
        <h1 className="text-2xl font-bold text-stone-900">Moderation Queue</h1>
        <p className="text-sm text-stone-500 mt-0.5">
        {formatNumber(total)} dataset{total !== 1 ? 's' : ''} awaiting review
        </p>
        </div>
        {total > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
            <Clock size={14} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700">{total} pending</span>
            </div>
        )}
        </div>

        {/* List */}
        {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : datasets.length === 0 ? (
            <EmptyState
            icon={CheckCircle2}
            title="Queue is clear"
            description="No datasets are currently waiting for review. Great work!"
            />
        ) : (
            <div className="space-y-4">
            {datasets.map((ds) => {
                const isExpanded = expanded === ds._id

                return (
                    <div
                    key={ds._id}
                    className="rounded-xl border border-stone-200 bg-white overflow-hidden"
                    >
                    {/* Top row */}
                    <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={ds.moderationStatus === 'under_review' ? 'warning' : 'info'}>
                    {ds.moderationStatus === 'under_review' ? 'Under Review' : 'Submitted'}
                    </Badge>
                    <Badge variant="primary">{getCategoryLabel(ds.category)}</Badge>
                    <Badge variant="default">{ds.license?.toUpperCase()}</Badge>
                    </div>
                    <h3 className="text-base font-semibold text-stone-900 mt-1">{ds.title}</h3>
                    {ds.description && (
                        <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                        {truncate(ds.description, 200)}
                        </p>
                    )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                    <Link
                    to={`/datasets/${ds.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-md px-2.5 py-1.5"
                    >
                    <ExternalLink size={12} /> Preview
                    </Link>
                    {ds.moderationStatus !== 'under_review' && (
                        <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moderate(ds.slug, 'under_review')}
                        loading={acting}
                        >
                        Mark as Reviewing
                        </Button>
                    )}
                    <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openReject(ds)}
                    >
                    <XCircle size={14} />
                    Reject
                    </Button>
                    <Button
                    size="sm"
                    onClick={() => moderate(ds.slug, 'approved')}
                    loading={acting}
                    className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    >
                    <CheckCircle2 size={14} />
                    Approve
                    </Button>
                    </div>
                    </div>

                    {/* Meta grid */}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                    <DatasetMeta
                    label="Uploader"
                    value={ds.uploader?.name}
                    icon={User}
                    />
                    {ds.organization && (
                        <DatasetMeta
                        label="Organization"
                        value={ds.organization?.name}
                        icon={Building2}
                        />
                    )}
                    <DatasetMeta
                    label="Files"
                    value={ds.files?.length ? `${ds.files.length} file${ds.files.length > 1 ? 's' : ''}` : null}
                    icon={FileText}
                    />
                    <DatasetMeta
                    label="Temporal"
                    value={ds.temporalCoverage}
                    icon={Calendar}
                    />
                    <DatasetMeta
                    label="Countries"
                    value={ds.geographicScope?.join(', ')}
                    icon={Download}
                    />
                    <div className="flex items-start gap-2">
                    <Clock size={13} className="text-stone-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-stone-400">
                    Submitted {formatDistanceToNow(new Date(ds.createdAt), { addSuffix: true })}
                    </span>
                    </div>
                    </div>
                    </div>

                    {/* Expand: Files */}
                    {ds.files?.length > 0 && (
                        <>
                        <button
                        onClick={() => setExpanded(isExpanded ? null : ds._id)}
                        className="w-full text-left px-5 py-2.5 border-t border-stone-100 bg-stone-50 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                        >
                        {isExpanded ? '▲ Hide files' : `▼ Show ${ds.files.length} file${ds.files.length > 1 ? 's' : ''}`}
                        </button>
                        {isExpanded && (
                            <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 space-y-1.5">
                            {ds.files.map((file) => (
                                <div key={file._id} className="flex items-center gap-3 text-xs text-stone-600">
                                <FileText size={12} className="text-stone-400 shrink-0" />
                                <span className="font-medium">{file.name}</span>
                                <Badge variant="default">{file.format}</Badge>
                                {file.rowCount && (
                                    <span className="text-stone-400">{formatNumber(file.rowCount)} rows</span>
                                )}
                                </div>
                            ))}
                            </div>
                        )}
                        </>
                    )}

                    {/* Quality Score strip */}
                    {ds.qualityScore?.overall != null && (
                        <div className="px-5 py-3 border-t border-stone-100 flex items-center gap-3">
                        <span className="text-xs text-stone-400">Quality Score</span>
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden max-w-[200px]">
                        <div
                        className={`h-full rounded-full ${
                            ds.qualityScore.overall >= 70 ? 'bg-green-500' :
                            ds.qualityScore.overall >= 40 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${ds.qualityScore.overall}%` }}
                        />
                        </div>
                        <span className="text-xs font-semibold text-stone-700">
                        {ds.qualityScore.overall}/100
                        </span>
                        </div>
                    )}
                    </div>
                )
            })}

            <div className="flex justify-center mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            </div>
        )}

        {/* Reject Modal */}
        <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Dataset"
        size="md"
        >
        {rejectTarget && (
            <div className="space-y-4">
            <p className="text-sm text-stone-600">
            You are about to reject <span className="font-semibold">"{rejectTarget.title}"</span>.
            Provide a note explaining why so the uploader can improve their submission.
            </p>
            <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700">
            Rejection Note <span className="text-red-500">*</span>
            </label>
            <textarea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain what needs to be improved…"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
            </div>
            <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)}>
            Cancel
            </Button>
            <Button
            variant="danger"
            size="sm"
            loading={acting}
            disabled={!rejectNote.trim()}
            onClick={() => moderate(rejectTarget.slug, 'rejected', rejectNote)}
            >
            Reject Dataset
            </Button>
            </div>
            </div>
        )}
        </Modal>

        </div>
    )
}
