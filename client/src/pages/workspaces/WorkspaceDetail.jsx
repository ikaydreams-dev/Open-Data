import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
    FolderOpen, Plus, Trash2, Pencil, X, Search, Database,
    Lock, Globe, Check, ArrowLeft, Download, Heart, FileText,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useWorkspaces, useWorkspace } from '../../hooks/useWorkspaces'
import { datasetsApi } from '../../api/datasets.api'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { Input } from '../../components/shared/Input'
import { Textarea } from '../../components/shared/Textarea'
import { Modal } from '../../components/shared/Modal'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageSpinner, Spinner } from '../../components/shared/Spinner'
import { DATASET_CATEGORIES } from '../../lib/constants'
import { formatNumber, truncate, cn } from '../../lib/utils'

function getCategoryLabel(value) {
    return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

// Compact dataset card used inside the workspace grid
function WorkspaceDatasetCard({ dataset, onRemove }) {
    return (
        <div className="group relative bg-white border border-stone-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all">
        {/* Remove button */}
        <button
        onClick={() => onRemove(dataset.slug)}
        className="absolute top-3 right-3 p-1 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        title="Remove from workspace"
        >
        <X size={14} />
        </button>

        <Link to={`/datasets/${dataset.slug}`} className="block pr-6">
        <h3 className="text-sm font-semibold text-stone-900 hover:text-orange-700 transition-colors leading-snug line-clamp-2 mb-2">
        {dataset.title}
        </h3>
        {dataset.description && (
            <p className="text-xs text-stone-500 mb-2 line-clamp-2 leading-relaxed">
            {truncate(dataset.description, 90)}
            </p>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
        {dataset.category && (
            <Badge variant="primary">{getCategoryLabel(dataset.category)}</Badge>
        )}
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-400">
        <span className="flex items-center gap-1">
        <Download size={11} /> {formatNumber(dataset.downloadCount ?? 0)}
        </span>
        <span className="flex items-center gap-1">
        <Heart size={11} /> {formatNumber(dataset.likeCount ?? 0)}
        </span>
        {dataset.fileCount != null && (
            <span className="flex items-center gap-1">
            <FileText size={11} /> {dataset.fileCount}
            </span>
        )}
        </div>
        </Link>

        {dataset.addedAt && (
            <p className="text-[11px] text-stone-300 mt-2 pt-2 border-t border-stone-100">
            Added {formatDistanceToNow(new Date(dataset.addedAt), { addSuffix: true })}
            </p>
        )}
        </div>
    )
}

// Search-and-select modal for adding datasets
function AddDatasetModal({ open, onClose, onAdd, alreadyAdded = [] }) {
    const [query, setQuery] = useState('')
    const [adding, setAdding] = useState(null)

    const { data, isFetching } = useQuery({
        queryKey: ['dataset-search-ws', query],
        queryFn: () =>
        datasetsApi.list({ limit: 12, ...(query ? { sort: 'newest' } : { sort: 'downloads' }) })
        .then((r) => r.data),
                                          keepPreviousData: true,
    })

    // Client-side filter by query (avoids debounce complexity)
    const results = (data?.datasets ?? []).filter((d) =>
    !query.trim() ||
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.category?.toLowerCase().includes(query.toLowerCase())
    )

    async function handleAdd(dataset) {
        setAdding(dataset.slug)
        try {
            await onAdd(dataset)
        } finally {
            setAdding(null)
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Add Dataset to Workspace" size="lg">
        <div className="space-y-4">
        {/* Search */}
        <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
        type="text"
        placeholder="Search datasets by title or category…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        autoFocus
        />
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {isFetching && !data ? (
            <div className="flex justify-center py-8"><Spinner /></div>
        ) : results.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No datasets found.</p>
        ) : (
            results.map((ds) => {
                const isAdded = alreadyAdded.includes(ds.slug)
                return (
                    <div
                    key={ds._id ?? ds.slug}
                    className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                        isAdded ? 'border-green-200 bg-green-50' : 'border-stone-200 bg-white hover:border-orange-200',
                    )}
                    >
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 line-clamp-1">{ds.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                    {ds.category && (
                        <Badge variant="primary">{getCategoryLabel(ds.category)}</Badge>
                    )}
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Download size={10} /> {formatNumber(ds.downloadCount ?? 0)}
                    </span>
                    </div>
                    </div>
                    <button
                    disabled={isAdded || adding === ds.slug}
                    onClick={() => handleAdd(ds)}
                    className={cn(
                        'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                        isAdded
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-50',
                    )}
                    >
                    {isAdded ? (
                        <><Check size={12} /> Added</>
                    ) : adding === ds.slug ? (
                        <Spinner size="sm" />
                    ) : (
                        <><Plus size={12} /> Add</>
                    )}
                    </button>
                    </div>
                )
            })
        )}
        </div>

        <div className="flex justify-end pt-1">
        <Button variant="outline" size="sm" onClick={onClose}>Done</Button>
        </div>
        </div>
        </Modal>
    )
}

export default function WorkspaceDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const { updateWorkspace, isUpdating, deleteWorkspace, isDeleting, addDataset, removeDataset } = useWorkspaces()

    const [editOpen, setEditOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const { data: workspace, isLoading, isError } = useWorkspace(id)

    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    function openEdit() {
        reset({ name: workspace.name, description: workspace.description, visibility: workspace.visibility })
        setEditOpen(true)
    }

    async function handleSave(data) {
        try {
            await updateWorkspace({ id, ...data })
            // Invalidate the single-workspace query too
            queryClient.invalidateQueries({ queryKey: ['workspace', user?._id, id] })
            toast.success('Workspace updated')
            setEditOpen(false)
        } catch {
            toast.error('Failed to update workspace')
        }
    }

    async function handleDelete() {
        try {
            await deleteWorkspace(id)
            toast.success('Workspace deleted')
            navigate('/workspaces')
        } catch {
            toast.error('Failed to delete workspace')
        }
    }

    async function handleAddDataset(dataset) {
        try {
            await addDataset({ workspaceId: id, dataset })
            queryClient.invalidateQueries({ queryKey: ['workspace', user?._id, id] })
            toast.success(`"${dataset.title}" added`)
        } catch (err) {
            toast.error(err?.message === 'Dataset already in workspace' ? 'Already in this workspace' : 'Failed to add dataset')
        }
    }

    async function handleRemoveDataset(slug) {
        try {
            await removeDataset({ workspaceId: id, slug })
            queryClient.invalidateQueries({ queryKey: ['workspace', user?._id, id] })
            toast.success('Dataset removed')
        } catch {
            toast.error('Failed to remove dataset')
        }
    }

    if (isLoading) return <PageSpinner />

        if (isError || !workspace) {
            return (
                <div className="max-w-2xl mx-auto px-4 py-16">
                <EmptyState
                icon={FolderOpen}
                title="Workspace not found"
                description="This workspace doesn't exist or you don't have access."
                action={
                    <Button variant="outline" onClick={() => navigate('/workspaces')}>
                    <ArrowLeft size={14} /> Back to Workspaces
                    </Button>
                }
                />
                </div>
            )
        }

        const alreadyAdded = workspace.datasets.map((d) => d.slug)

        return (
            <div className="max-w-5xl mx-auto px-4 py-8">

            {/* Breadcrumb */}
            <Link
            to="/workspaces"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-700 mb-6"
            >
            <ArrowLeft size={14} /> Workspaces
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <FolderOpen size={22} className="text-orange-600" />
            </div>
            <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-stone-900">{workspace.name}</h1>
            <Badge variant={workspace.visibility === 'shared' ? 'info' : 'default'} className="flex items-center gap-1">
            {workspace.visibility === 'shared'
                ? <><Globe size={11} /> Shared</>
                : <><Lock size={11} /> Private</>
            }
            </Badge>
            </div>
            {workspace.description && (
                <p className="text-sm text-stone-500 mt-1 max-w-xl">{workspace.description}</p>
            )}
            <p className="text-xs text-stone-400 mt-1.5">
            {workspace.datasets.length} {workspace.datasets.length === 1 ? 'dataset' : 'datasets'} ·{' '}
            Updated {formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true })}
            </p>
            </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil size={14} /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Dataset
            </Button>
            <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
            <Trash2 size={14} />
            </Button>
            </div>
            </div>

            {/* Datasets grid */}
            {workspace.datasets.length === 0 ? (
                <EmptyState
                icon={Database}
                title="No datasets yet"
                description="Add datasets from the platform to organize your research in one place."
                action={
                    <Button onClick={() => setAddOpen(true)}>
                    <Plus size={15} /> Add Dataset
                    </Button>
                }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {workspace.datasets.map((ds) => (
                    <WorkspaceDatasetCard
                    key={ds.slug}
                    dataset={ds}
                    onRemove={handleRemoveDataset}
                    />
                ))}
                </div>
            )}

            {/* Edit Modal */}
            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Workspace" size="md">
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <Input
            label="Name"
            required
            error={errors.name?.message}
            {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
            })}
            />
            <Textarea
            label="Description"
            rows={3}
            {...register('description')}
            />
            <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Visibility</label>
            <div className="flex gap-3">
            {[
                { value: 'private', label: 'Private', icon: Lock },
                { value: 'shared',  label: 'Shared',  icon: Globe },
            ].map(({ value, label, icon: Icon }) => (
                <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
                >
                <input
                type="radio"
                value={value}
                {...register('visibility')}
                className="accent-orange-600"
                />
                <Icon size={14} className="text-stone-500" />
                <span className="text-sm text-stone-700">{label}</span>
                </label>
            ))}
            </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditOpen(false)}>
            Cancel
            </Button>
            <Button size="sm" type="submit" loading={isUpdating}>
            Save Changes
            </Button>
            </div>
            </form>
            </Modal>

            {/* Add Dataset Modal */}
            <AddDatasetModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onAdd={handleAddDataset}
            alreadyAdded={alreadyAdded}
            />

            {/* Delete Confirm */}
            <ConfirmDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Delete Workspace"
            message={`Permanently delete "${workspace.name}"? Your datasets won't be affected.`}
            confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
            danger
            />
            </div>
        )
}
