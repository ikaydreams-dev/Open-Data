// src/pages/profile/UserDatasets.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database, Eye, Pencil, Trash2, Upload } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { usersApi } from '../../api/users.api'
import { datasetsApi } from '../../api/datasets.api'
import { useAuthStore } from '../../store/authStore'
import { Table } from '../../components/shared/Table'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Pagination } from '../../components/shared/Pagination'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { PageSpinner } from '../../components/shared/Spinner'
import { formatNumber } from '../../lib/utils'
import { MODERATION_STATUS, VISIBILITY } from '../../lib/constants'

const statusVariant = {
  [MODERATION_STATUS.APPROVED]: 'success',
  [MODERATION_STATUS.UNDER_REVIEW]: 'warning',
  [MODERATION_STATUS.SUBMITTED]: 'info',
  [MODERATION_STATUS.REJECTED]: 'danger',
}

const statusLabel = {
  [MODERATION_STATUS.APPROVED]: 'Approved',
  [MODERATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [MODERATION_STATUS.SUBMITTED]: 'Submitted',
  [MODERATION_STATUS.REJECTED]: 'Rejected',
}

const visibilityVariant = {
  [VISIBILITY.PUBLIC]: 'success',
  [VISIBILITY.PRIVATE]: 'default',
  [VISIBILITY.ORGANIZATION]: 'info',
}

export default function UserDatasetsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-datasets', page],
    queryFn: () =>
      usersApi.getUserDatasets(user.username, { page, limit: 10 }).then((r) => r.data),
    enabled: !!user,
  })

  const datasets = data?.datasets ?? []
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useMutation({
    mutationFn: (slug) => datasetsApi.delete(slug),
    onSuccess: () => {
      toast.success('Dataset deleted')
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['my-datasets'] })
    },
    onError: () => toast.error('Failed to delete dataset'),
  })

  const columns = [
    {
      key: 'title',
      label: 'Dataset',
      render: (row) => (
        <div className="min-w-0">
          <Link
            to={`/datasets/${row.slug}`}
            className="text-sm font-medium text-stone-900 hover:text-orange-700 transition-colors truncate block"
          >
            {row.title}
          </Link>
          {row.category && (
            <p className="text-xs text-stone-400 mt-0.5 capitalize">{row.category}</p>
          )}
        </div>
      ),
    },
    {
      key: 'visibility',
      label: 'Visibility',
      render: (row) => (
        <Badge variant={visibilityVariant[row.visibility] ?? 'default'} className="capitalize">
          {row.visibility}
        </Badge>
      ),
    },
    {
      key: 'moderationStatus',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant[row.moderationStatus] ?? 'default'}>
          {statusLabel[row.moderationStatus] ?? row.moderationStatus}
        </Badge>
      ),
    },
    {
      key: 'downloadCount',
      label: 'Downloads',
      render: (row) => (
        <span className="text-sm text-stone-600">{formatNumber(row.downloadCount ?? 0)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Uploaded',
      render: (row) => (
        <span className="text-sm text-stone-500">
          {row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/datasets/${row.slug}`}
            className="p-1.5 rounded-md text-stone-400 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            title="View dataset"
          >
            <Eye size={15} />
          </Link>
          <Link
            to={`/datasets/${row.slug}/edit`}
            className="p-1.5 rounded-md text-stone-400 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            title="Edit dataset"
          >
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete dataset"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Datasets</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage and track the datasets you've uploaded
          </p>
        </div>
        <Link
          to="/datasets/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-700 text-white text-sm font-medium rounded-md hover:bg-orange-800 transition-colors"
        >
          <Upload size={15} /> Upload Dataset
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No datasets yet"
          description="You haven't uploaded any datasets. Start by uploading your first one."
          action={
            <Link
              to="/datasets/upload"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-700 text-white text-sm font-medium rounded-md hover:bg-orange-800 transition-colors"
            >
              <Upload size={14} /> Upload a Dataset
            </Link>
          }
        />
      ) : (
        <>
          <Table columns={columns} data={datasets} />
          <div className="flex justify-center mt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.slug)}
        title="Delete Dataset"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
