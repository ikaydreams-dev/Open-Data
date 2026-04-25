import { Download, Eye } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import { Table } from '../shared/Table'
import { EmptyState } from '../shared/EmptyState'
import { formatFileSize } from '../../lib/utils'

export function DatasetFileList({ files = [], onDownload, onPreview }) {
  const columns = [
    { key: 'name', label: 'File Name' },
    {
      key: 'format',
      label: 'Format',
      render: (row) => <Badge>{row.format?.toUpperCase()}</Badge>,
    },
    {
      key: 'size',
      label: 'Size',
      render: (row) => formatFileSize(row.size ?? 0),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          {onPreview && (
            <Button size="sm" variant="ghost" onClick={() => onPreview(row)} title="Preview">
              <Eye size={13} />
            </Button>
          )}
          {onDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(row._id, row.name)}
            >
              <Download size={13} /> Download
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={files}
      emptyMessage="No files attached to this dataset."
    />
  )
}
