// src/components/workspaces/WorkspaceCard.jsx
import { Link } from 'react-router-dom'
import {
  Database,
  Clock,
  Lock,
  Globe,
  MoreVertical,
  Pencil,
  Trash2,
  Play,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { KernelStatusBadge } from './KernelStatusBadge'
import { Badge } from '../shared/Badge'

// Maps language identifier to a human-readable label and color
const LANGUAGE_CONFIG = {
  python: { label: 'Python', color: 'bg-blue-100 text-blue-700' },
  r:      { label: 'R',      color: 'bg-cyan-100 text-cyan-700' },
  sql:    { label: 'SQL',    color: 'bg-violet-100 text-violet-700' },
}

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function WorkspaceCard({ workspace, onDelete, onOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const {
    id,
    title,
    description,
    language = 'python',
    visibility = 'private',
    kernelStatus = 'stopped',
    attachedDatasets = [],
    updatedAt,
  } = workspace

  const lang = LANGUAGE_CONFIG[language] ?? { label: language, color: 'bg-stone-100 text-stone-600' }

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Card body */}
      <div className="flex-1 p-5">
        {/* Top row — language, visibility, kebab menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', lang.color)}>
              {lang.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
              {visibility === 'private'
                ? <><Lock size={11} /> Private</>
                : <><Globe size={11} /> Public</>
              }
            </span>
          </div>

          {/* Kebab menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.preventDefault(); setMenuOpen((o) => !o) }}
              className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-10">
                <Link
                  to={`/workspaces/${id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Pencil size={14} /> Edit
                </Link>
                <button
                  onClick={() => { onDelete?.(workspace); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/workspaces/${id}`}
          className="block text-base font-semibold text-stone-900 hover:text-orange-700 transition-colors line-clamp-1 mb-1"
        >
          {title}
        </Link>

        {/* Description */}
        {description && (
          <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        )}

        {/* Kernel status */}
        <div className="mb-3">
          <KernelStatusBadge status={kernelStatus} size="sm" />
        </div>

        {/* Attached datasets */}
        {attachedDatasets.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Database size={13} className="text-stone-400 shrink-0" />
            {attachedDatasets.slice(0, 2).map((ds) => (
              <Badge key={ds.slug} variant="default" className="text-xs">
                {ds.title}
              </Badge>
            ))}
            {attachedDatasets.length > 2 && (
              <span className="text-xs text-stone-400">+{attachedDatasets.length - 2} more</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
          <Clock size={12} />
          {updatedAt ? formatRelativeTime(updatedAt) : '—'}
        </span>

        <button
          onClick={() => onOpen?.(workspace)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                     bg-orange-700 text-white hover:bg-orange-800 transition-colors"
        >
          <Play size={11} fill="currentColor" />
          Open
        </button>
      </div>
    </div>
  )
}
