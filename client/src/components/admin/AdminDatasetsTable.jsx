import { Table } from '../shared/Table'
import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import { Pagination } from '../shared/Pagination'
import { CheckCircle, XCircle, Eye, Database } from 'lucide-react'

// Temporary inline formatters
const formatDate = (dateString) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(dateString));
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function AdminDatasetsTable({ 
  datasets = [], 
  isLoading,
  page,
  totalPages,
  onPageChange,
  onVerify,
  onReject,
  onView
}) {
  const columns = [
    {
      key: 'dataset',
      label: 'Dataset Info',
      render: (row) => (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Database size={18} className="text-stone-400" />
          </div>
          <div>
            <p className="font-medium text-stone-900 hover:text-orange-600 cursor-pointer" onClick={() => onView(row.id)}>
              {row.title}
            </p>
            <p className="text-xs text-stone-500">by {row.ownerName} • {formatBytes(row.sizeInBytes)}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="text-sm text-stone-600">{row.category}</span>
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      render: (row) => formatDate(row.uploadedAt)
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variants = {
          VERIFIED: 'success',
          PENDING: 'warning',
          REJECTED: 'danger'
        };
        return <Badge variant={variants[row.status] || 'default'}>{row.status}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Review Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' && (
            <>
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => onVerify(row.id)}>
                <CheckCircle size={16} />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onReject(row.id)}>
                <XCircle size={16} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => onView(row.id)}>
            <Eye size={16} />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <Table columns={columns} data={datasets} emptyMessage={isLoading ? "Loading datasets..." : "No datasets require review."} />
      <div className="flex justify-end">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}