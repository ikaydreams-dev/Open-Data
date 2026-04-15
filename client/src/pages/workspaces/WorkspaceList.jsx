import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Lock, Globe, Database, Trash2, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useWorkspaces } from '../../hooks/useWorkspaces'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { PageSpinner } from '../../components/shared/Spinner'
import { cn } from '../../lib/utils'

function VisibilityIcon({ visibility }) {
    return visibility === 'shared'
    ? <Globe size={12} className="text-blue-500" />
    : <Lock size={12} className="text-stone-400" />
}

export default function WorkspaceList() {
    const navigate = useNavigate()
    const { workspaces, isLoading, deleteWorkspace, isDeleting } = useWorkspaces()
    const [deleteTarget, setDeleteTarget] = useState(null)

    async function handleDelete() {
        try {
            await deleteWorkspace(deleteTarget.id)
            toast.success('Workspace deleted')
            setDeleteTarget(null)
        } catch {
            toast.error('Failed to delete workspace')
        }
    }

    if (isLoading) return <PageSpinner />

        return (
            <div className="max-w-5xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
            <div>
            <h1 className="text-2xl font-bold text-stone-900">Workspaces</h1>
            <p className="text-sm text-stone-500 mt-1">
            Organize datasets into private collections for your research projects.
            </p>
            </div>
            <Button onClick={() => navigate('/workspaces/create')}>
            <Plus size={16} />
            New Workspace
            </Button>
            </div>

            {/* Empty */}
            {workspaces.length === 0 ? (
                <EmptyState
                icon={FolderOpen}
                title="No workspaces yet"
                description="Create a workspace to start organizing datasets for your research."
                action={
                    <Button onClick={() => navigate('/workspaces/create')}>
                    <Plus size={15} /> New Workspace
                    </Button>
                }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {workspaces.map((ws) => (
                    <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    onDelete={() => setDeleteTarget(ws)}
                    />
                ))}

                {/* Create new — ghost card */}
                <button
                onClick={() => navigate('/workspaces/create')}
                className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200',
                    'min-h-[160px] text-stone-400 hover:border-orange-300 hover:text-orange-600',
                    'transition-colors cursor-pointer',
                )}
                >
                <Plus size={22} />
                <span className="text-sm font-medium">New Workspace</span>
                </button>
                </div>
            )}

            <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            title="Delete Workspace"
            message={`Permanently delete "${deleteTarget?.name}"? Your saved datasets won't be deleted, only this workspace.`}
            confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
            danger
            />
            </div>
        )
}

function WorkspaceCard({ workspace, onDelete }) {
    const { id, name, description, visibility, datasets, updatedAt } = workspace

    return (
        <div className="group relative bg-white border border-stone-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-sm transition-all flex flex-col gap-3">

        {/* Delete button — appears on hover */}
        <button
        onClick={(e) => { e.preventDefault(); onDelete() }}
        className="absolute top-3 right-3 p-1.5 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete workspace"
        >
        <Trash2 size={14} />
        </button>

        {/* Icon + visibility */}
        <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
        <FolderOpen size={20} className="text-orange-600" />
        </div>
        <Badge variant={visibility === 'shared' ? 'info' : 'default'} className="flex items-center gap-1">
        <VisibilityIcon visibility={visibility} />
        {visibility === 'shared' ? 'Shared' : 'Private'}
        </Badge>
        </div>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
        <Link
        to={`/workspaces/${id}`}
        className="block font-semibold text-stone-900 hover:text-orange-700 transition-colors leading-snug mb-1 pr-6"
        >
        {name}
        </Link>
        {description && (
            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{description}</p>
        )}
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100">
        <span className="flex items-center gap-1.5">
        <Database size={12} />
        {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'}
        </span>
        <span className="flex items-center gap-1">
        <Calendar size={11} />
        {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
        </div>
        </div>
    )
}
