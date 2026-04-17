// src/components/workspaces/DatasetAttachPanel.jsx
// Lets the user search for datasets and attach/detach them from a workspace.
// Attached datasets are made available inside the kernel as file paths.
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, Plus, X, Database, Loader } from 'lucide-react'
import { workspacesApi } from '../../api/workspaces.api'
import { datasetsApi } from '../../api/datasets.api'
import { queryClient } from '../../lib/queryClient'
import { useDebounce } from '../../hooks/useDebounce'
import { FileIcon } from '../shared/FileIcon'
import { Badge } from '../shared/Badge'
import { EmptyState } from '../shared/EmptyState'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const attachedKey = (workspaceId) => ['workspace', workspaceId, 'datasets']

export function DatasetAttachPanel({ workspaceId }) {
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const debouncedQuery = useDebounce(query, 350)

  // ── Attached datasets ──────────────────────────────────────────────────────
  const { data: attached = [], isLoading: isLoadingAttached } = useQuery({
    queryKey: attachedKey(workspaceId),
    queryFn: () => workspacesApi.getAttachedDatasets(workspaceId).then((r) => r.data),
    enabled: !!workspaceId,
  })

  // ── Dataset search ─────────────────────────────────────────────────────────
  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ['datasetSearch', debouncedQuery],
    queryFn:  () =>
      datasetsApi.list({ q: debouncedQuery, limit: 8 }).then((r) => r.data?.datasets ?? []),
    enabled: debouncedQuery.length >= 2,
  })

  const attachedSlugs = new Set(attached.map((d) => d.slug))

  // ── Attach mutation ────────────────────────────────────────────────────────
  const attachMutation = useMutation({
    mutationFn: (slug) => workspacesApi.attachDataset(workspaceId, slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: attachedKey(workspaceId) })
      toast.success('Dataset attached.')
      setQuery('')
    },
    onError: () => toast.error('Failed to attach dataset.'),
  })

  // ── Detach mutation ────────────────────────────────────────────────────────
  const detachMutation = useMutation({
    mutationFn: (slug) => workspacesApi.detachDataset(workspaceId, slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachedKey(workspaceId) })
      toast.success('Dataset removed.')
    },
    onError: () => toast.error('Failed to remove dataset.'),
  })

  const showDropdown = searchFocused && debouncedQuery.length >= 2

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-0.5">Attached datasets</h3>
        <p className="text-xs text-stone-500">
          Datasets attached here are available inside your kernel as local files.
        </p>
      </div>

      {/* Search input with dropdown */}
      <div className="relative">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Search datasets to attach…"
            className={cn(
              'w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-stone-300 bg-white',
              'placeholder:text-stone-400',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
            )}
          />
          {isSearching && (
            <Loader size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 animate-spin" />
          )}
        </div>

        {/* Search dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {searchResults.length === 0 && !isSearching ? (
              <div className="px-4 py-3 text-sm text-stone-500 text-center">
                No datasets found for "{debouncedQuery}"
              </div>
            ) : (
              <ul>
                {searchResults.map((dataset) => {
                  const isAttached = attachedSlugs.has(dataset.slug)
                  return (
                    <li key={dataset.slug}>
                      <button
                        disabled={isAttached || attachMutation.isPending}
                        onClick={() => attachMutation.mutate(dataset.slug)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isAttached
                            ? 'opacity-50 cursor-not-allowed bg-stone-50'
                            : 'hover:bg-orange-50',
                        )}
                      >
                        <Database size={15} className="text-stone-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">
                            {dataset.title}
                          </p>
                          <p className="text-xs text-stone-400 truncate">{dataset.slug}</p>
                        </div>
                        {isAttached ? (
                          <Badge variant="success">Attached</Badge>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                            <Plus size={12} /> Attach
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Attached datasets list */}
      <div className="flex flex-col gap-2">
        {isLoadingAttached ? (
          <div className="flex items-center justify-center py-6">
            <Loader size={18} className="text-stone-400 animate-spin" />
          </div>
        ) : attached.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No datasets attached"
            description="Search above to attach a dataset to this workspace."
          />
        ) : (
          attached.map((dataset) => (
            <div
              key={dataset.slug}
              className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-stone-200"
            >
              <Database size={15} className="text-orange-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{dataset.title}</p>
                <p className="font-mono text-xs text-stone-400 truncate">/data/{dataset.slug}</p>
              </div>

              {/* File format badges */}
              {dataset.formats?.slice(0, 2).map((fmt) => (
                <FileIcon key={fmt} format={fmt} size="sm" />
              ))}

              <button
                onClick={() => detachMutation.mutate(dataset.slug)}
                disabled={detachMutation.isPending}
                className="p-1 ml-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                title="Remove dataset"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
