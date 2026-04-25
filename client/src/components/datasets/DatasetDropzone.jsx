import { useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { formatFileSize } from '../../lib/utils'

export function DatasetDropzone({ files = [], onAdd, onRemove, disabled = false }) {
  const fileInputRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    if (disabled) return
    const incoming = e.dataTransfer.files
    if (incoming?.length) onAdd(Array.from(incoming))
  }

  function handleChange(e) {
    if (e.target.files?.length) {
      onAdd(Array.from(e.target.files))
      e.target.value = '' // reset so the same file can be re-added if removed
    }
  }

  function handleClick() {
    if (!disabled) fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors
          ${disabled
            ? 'border-stone-200 bg-stone-50 cursor-not-allowed opacity-60'
            : 'border-stone-300 hover:border-orange-300 hover:bg-stone-50 cursor-pointer'
          }`}
      >
        <Upload size={28} className="mx-auto mb-2 text-stone-400" />
        <p className="text-sm font-medium text-stone-700">Drag & drop files here</p>
        <p className="text-xs text-stone-400 mt-1">
          or click to browse — CSV, JSON, GeoJSON, Parquet, XLSX, Shapefile, PDF
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3 bg-white">
              <FileText size={16} className="text-stone-400 shrink-0" />
              <span className="flex-1 text-sm text-stone-700 truncate">{f.name}</span>
              <Badge variant="default">{f.format ?? f.name.split('.').pop().toUpperCase()}</Badge>
              <span className="text-xs text-stone-400 shrink-0">{formatFileSize(f.size)}</span>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(i) }}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
