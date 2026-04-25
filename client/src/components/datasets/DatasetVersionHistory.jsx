import { formatDistanceToNow } from 'date-fns'

export function DatasetVersionHistory({ versions = [] }) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-stone-400 py-6 text-center">
        No version history available.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {versions.map((v) => (
        <div
          key={v._id}
          className="flex items-start gap-3 border-b border-stone-100 pb-3 last:border-0"
        >
          <span className="shrink-0 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded mt-0.5">
            v{v.versionNumber}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-700">
              {v.changelog ?? 'No changelog provided.'}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
              {v.createdBy?.name && <span>{v.createdBy.name}</span>}
              <span>{formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}</span>
            </div>
            {v.files?.length > 0 && (
              <p className="text-xs text-stone-400 mt-1">
                {v.files.length} {v.files.length === 1 ? 'file' : 'files'} in this version
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
