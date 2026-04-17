import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import { AlertTriangle, MessageSquare, Database, FileCode, Check, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function FlaggedContentCard({ 
  report, 
  onResolve, 
  onDeleteContent 
}) {
  // Map content type to specific icons
  const TypeIcon = {
    COMMENT: MessageSquare,
    DATASET: Database,
    NOTEBOOK: FileCode
  }[report.contentType] || AlertTriangle;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="danger" className="uppercase tracking-wider text-[10px]">
            {report.reason}
          </Badge>
          <span className="text-xs text-stone-500">Reported by {report.reporterName}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-400 text-xs font-medium">
          <TypeIcon size={14} />
          {report.contentType}
        </div>
      </div>

      <div className="bg-stone-50 rounded-lg p-3 mb-4 border border-stone-100">
        <p className="text-sm text-stone-800 line-clamp-3 italic">
          "{report.contentSnippet}"
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
        <span className="text-xs text-stone-500">
          Author: <span className="font-medium text-stone-700">{report.authorName}</span>
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onResolve(report.id)}>
            <Check size={16} />
            <span className="hidden sm:inline ml-1">Dismiss</span>
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDeleteContent(report.contentId)}>
            <Trash2 size={16} />
            <span className="hidden sm:inline ml-1">Remove Content</span>
          </Button>
        </div>
      </div>
    </div>
  )
}