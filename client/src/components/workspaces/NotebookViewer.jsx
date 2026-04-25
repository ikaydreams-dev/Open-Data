// src/components/workspaces/NotebookViewer.jsx
// Renders a notebook document: code cells, markdown cells, and their outputs.
// The kernel control toolbar sits at the top and reflects live kernel status.
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Plus,
  ChevronDown,
  ChevronUp,
  Terminal,
  FileText,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { workspacesApi } from '../../api/workspaces.api'
import { KernelStatusBadge } from './KernelStatusBadge'
import { Button } from '../shared/Button'
import toast from 'react-hot-toast'

// ── Cell components ──────────────────────────────────────────────────────────

function CodeCell({ cell, index, onCellChange, canRun }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="group relative rounded-lg border border-stone-200 bg-white overflow-hidden">
      {/* Cell header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-50 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-stone-400" />
          <span className="text-xs text-stone-400 font-mono">In [{index + 1}]</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-0.5 rounded text-stone-400 hover:text-stone-600"
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {/* Source editor */}
      {!collapsed && (
        <textarea
          value={cell.source}
          onChange={(e) => onCellChange(cell.id, 'source', e.target.value)}
          spellCheck={false}
          className={cn(
            'w-full font-mono text-sm text-stone-800 bg-white px-4 py-3 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400',
            'min-h-[80px]',
          )}
          style={{ tabSize: 2 }}
          onKeyDown={(e) => {
            // Allow tab indentation inside code cells
            if (e.key === 'Tab') {
              e.preventDefault()
              const { selectionStart, selectionEnd, value } = e.target
              const newVal = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd)
              onCellChange(cell.id, 'source', newVal)
            }
          }}
        />
      )}

      {/* Output */}
      {!collapsed && cell.output && (
        <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 font-mono text-xs text-stone-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
          {cell.output}
        </div>
      )}
    </div>
  )
}

function MarkdownCell({ cell, onCellChange }) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      className="group rounded-lg border border-stone-100 bg-white overflow-hidden"
      onDoubleClick={() => setEditing(true)}
    >
      {/* Cell header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 border-b border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <FileText size={12} className="text-stone-400" />
        <span className="text-xs text-stone-400">Markdown</span>
        <button
          onClick={() => setEditing((e) => !e)}
          className="ml-auto text-xs text-orange-600 hover:text-orange-800"
        >
          {editing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <textarea
          autoFocus
          value={cell.source}
          onChange={(e) => onCellChange(cell.id, 'source', e.target.value)}
          onBlur={() => setEditing(false)}
          className="w-full px-4 py-3 text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 min-h-[80px] font-mono"
        />
      ) : (
        <div className="px-4 py-3 text-sm text-stone-700 leading-relaxed prose prose-stone max-w-none">
          {/* Render markdown as plain text — a proper markdown renderer
              (e.g. react-markdown) should be swapped in once installed */}
          {cell.source || (
            <span className="text-stone-400 italic">Double-click to edit markdown…</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── NotebookViewer ───────────────────────────────────────────────────────────

export function NotebookViewer({ workspaceId, notebook: initialNotebook, kernelStatus }) {
  const [cells, setCells] = useState(
    initialNotebook?.cells ?? [
      { id: crypto.randomUUID(), type: 'code', source: '', output: null },
    ],
  )

  const updateCell = useCallback((id, field, value) => {
    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    )
  }, [])

  const addCell = (type = 'code') => {
    setCells((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, source: '', output: null },
    ])
  }

  // Save notebook to the server
  const saveMutation = useMutation({
    mutationFn: () =>
      workspacesApi.saveNotebook(workspaceId, { cells }).then((r) => r.data),
    onSuccess: () => toast.success('Notebook saved.'),
    onError:   () => toast.error('Failed to save notebook.'),
  })

  // Kernel control mutations
  const startMutation   = useMutation({ mutationFn: () => workspacesApi.startKernel(workspaceId),   onError: () => toast.error('Could not start kernel.') })
  const stopMutation    = useMutation({ mutationFn: () => workspacesApi.stopKernel(workspaceId),    onError: () => toast.error('Could not stop kernel.') })
  const restartMutation = useMutation({ mutationFn: () => workspacesApi.restartKernel(workspaceId), onSuccess: () => toast.success('Kernel restarted.'), onError: () => toast.error('Could not restart kernel.') })

  const isKernelBusy = kernelStatus === 'busy' || kernelStatus === 'running' || kernelStatus === 'starting'
  const canRun = kernelStatus === 'idle'

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-stone-200 shrink-0 flex-wrap">
        {/* Kernel controls */}
        <div className="flex items-center gap-1">
          {kernelStatus === 'stopped' || kernelStatus === 'error' ? (
            <Button
              size="sm"
              variant="primary"
              loading={startMutation.isPending}
              onClick={() => startMutation.mutate()}
            >
              <Play size={13} fill="currentColor" /> Start kernel
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={!isKernelBusy}
                loading={stopMutation.isPending}
                onClick={() => stopMutation.mutate()}
                title="Interrupt kernel"
              >
                <Square size={13} fill="currentColor" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                loading={restartMutation.isPending}
                onClick={() => restartMutation.mutate()}
                title="Restart kernel"
              >
                <RotateCcw size={13} />
              </Button>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-stone-200" />

        {/* Save */}
        <Button
          size="sm"
          variant="outline"
          loading={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          <Save size={13} /> Save
        </Button>

        {/* Kernel status — right side */}
        <div className="ml-auto">
          <KernelStatusBadge status={kernelStatus} size="sm" />
        </div>
      </div>

      {/* Cells */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
        {cells.map((cell, index) =>
          cell.type === 'code' ? (
            <CodeCell
              key={cell.id}
              cell={cell}
              index={index}
              onCellChange={updateCell}
              canRun={canRun}
            />
          ) : (
            <MarkdownCell
              key={cell.id}
              cell={cell}
              onCellChange={updateCell}
            />
          ),
        )}

        {/* Add cell controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => addCell('code')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-dashed border-stone-300 text-stone-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            <Plus size={12} /> Code cell
          </button>
          <button
            onClick={() => addCell('markdown')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-dashed border-stone-300 text-stone-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            <Plus size={12} /> Markdown cell
          </button>
        </div>
      </div>
    </div>
  )
}
