import { X, FileText, Table2, Hash, Type, Calendar, List } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { Modal } from '../shared/Modal'
import { formatFileSize } from '../../lib/utils'

function getTypeIcon(type) {
  switch (type) {
    case 'number': return <Hash size={12} className="text-blue-500" />
    case 'date': return <Calendar size={12} className="text-purple-500" />
    case 'string': return <Type size={12} className="text-green-500" />
    default: return <List size={12} className="text-stone-400" />
  }
}

export function FilePreviewModal({ open, onClose, file, previewData }) {
  if (!file) return null

  const {
    name,
    format,
    size,
    rowCount,
    columnCount,
    columns = [],
    previewData: tableData = [],
  } = previewData || {}

  const headers = tableData[0] || []
  const rows = tableData.slice(1)

  return (
    <Modal open={open} onClose={onClose} title={name || file.name} size="xl">
      <div className="space-y-4">
        {/* File info */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="primary">{format || file.format}</Badge>
          <span className="text-stone-500">{formatFileSize(size || file.size)}</span>
          {rowCount > 0 && (
            <span className="text-stone-500">
              <span className="font-medium text-stone-700">{rowCount.toLocaleString()}</span> rows
            </span>
          )}
          {columnCount > 0 && (
            <span className="text-stone-500">
              <span className="font-medium text-stone-700">{columnCount}</span> columns
            </span>
          )}
        </div>

        {/* Data dictionary */}
        {columns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-stone-800 mb-2 flex items-center gap-2">
              <FileText size={14} />
              Data Dictionary
            </h3>
            <div className="border border-stone-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-stone-600">Column</th>
                    <th className="text-left px-3 py-2 font-medium text-stone-600">Type</th>
                    <th className="text-left px-3 py-2 font-medium text-stone-600">Sample Values</th>
                    <th className="text-right px-3 py-2 font-medium text-stone-600">Unique</th>
                    <th className="text-right px-3 py-2 font-medium text-stone-600">Nulls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {columns.map((col, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="px-3 py-2 font-mono text-xs text-stone-800">{col.name}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1.5 text-xs">
                          {getTypeIcon(col.type)}
                          {col.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {col.sampleValues?.slice(0, 3).map((v, j) => (
                            <span key={j} className="px-1.5 py-0.5 bg-stone-100 rounded text-xs text-stone-600 truncate max-w-24">
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-stone-500">{col.uniqueCount?.toLocaleString() || '-'}</td>
                      <td className="px-3 py-2 text-right text-stone-500">{col.nullCount?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data preview table */}
        {rows.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-stone-800 mb-2 flex items-center gap-2">
              <Table2 size={14} />
              Preview (first {rows.length} rows)
            </h3>
            <div className="border border-stone-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="text-left px-3 py-2 font-medium text-stone-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-stone-700 whitespace-nowrap max-w-48 truncate">
                          {cell ?? <span className="text-stone-300 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {columns.length === 0 && rows.length === 0 && (
          <div className="text-center py-8">
            <FileText size={32} className="mx-auto mb-2 text-stone-300" />
            <p className="text-sm text-stone-500">Preview not available for this file format.</p>
            <p className="text-xs text-stone-400 mt-1">Download the file to view its contents.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
