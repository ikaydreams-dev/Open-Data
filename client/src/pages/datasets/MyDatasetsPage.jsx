import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Database } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { datasetsApi } from '../../api/datasets.api'
import { useAuthStore } from '../../store/authStore'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatNumber } from '../../lib/utils'

function statusVariant(status) {
  return { approved: 'success', submitted: 'warning', under_review: 'info', rejected: 'danger' }[status] ?? 'default'
}

export default function MyDatasetsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteSlug, setDeleteSlug] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-datasets', user?._id],
    queryFn: () => datasetsApi.list({ uploader: user?._id, limit: 100 }).then((r) => r.data),
    enabled: !!user?._id,
  })

  const deleteMutation = useMutation({
    mutationFn: (slug) => datasetsApi.delete(slug),
    onSuccess: () => {
      toast.success('Dataset deleted')
      setDeleteSlug(null)
      queryClient.invalidateQueries({ queryKey: ['my-datasets'] })
    },
    onError: () => toast.error('Failed to delete dataset'),
  })

  const datasets = data?.datasets ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Datasets</h1>
          {!isLoading && (
            <p className="text-sm text-stone-500 mt-1">
              {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'}
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/datasets/upload')}>
          <Plus size={16} /> Upload Dataset
        </Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No datasets yet"
          description="Upload your first dataset to share it with the world."
          action={
            <Button onClick={() => navigate('/datasets/upload')}>
              <Plus size={15} /> Upload Dataset
            </Button>
          }
        />
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100">
          {datasets.map((dataset) => (
            <div key={dataset._id} className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-stone-50 transition-colors">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/datasets/${dataset.slug}`}
                  className="text-sm font-semibold text-stone-900 hover:text-orange-700 transition-colors line-clamp-1"
                >
                  {dataset.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                  <span>{formatNumber(dataset.downloadCount ?? 0)} downloads</span>
                  <span>{dataset.files?.length ?? dataset.fileCount ?? 0} files</span>
                  {dataset.updatedAt && (
                    <span>Updated {formatDistanceToNow(new Date(dataset.updatedAt), { addSuffix: true })}</span>
                  )}
                </div>
              </div>

              <Badge variant={statusVariant(dataset.moderationStatus)} className="shrink-0 capitalize">
                {dataset.moderationStatus?.replace('_', ' ')}
              </Badge>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/datasets/${dataset.slug}/edit`)}
                  title="Edit"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteSlug(dataset.slug)}
                  title="Delete"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteSlug}
        onClose={() => setDeleteSlug(null)}
        onConfirm={() => deleteMutation.mutate(deleteSlug)}
        title="Delete Dataset"
        message="This will permanently delete the dataset and all its files. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
