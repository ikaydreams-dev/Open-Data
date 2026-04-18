import { Badge } from '../shared/Badge'
import { StarRating } from '../shared/StarRating'
import { Download, Calendar, FileText } from 'lucide-react'

export function SearchResultCard({ dataset }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-stone-900 line-clamp-2">
          {dataset.title}
        </h3>
        <Badge variant="primary">{dataset.category}</Badge>
      </div>

      <p className="text-stone-600 text-sm mb-4 line-clamp-3">
        {dataset.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {dataset.tags.map((tag) => (
          <Badge key={tag} variant="default" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-stone-500 mb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText size={14} />
            {formatFileSize(dataset.fileSize)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(dataset.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Download size={14} />
            {dataset.downloads}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={dataset.rating} readonly />
          <span className="text-xs">({dataset.rating})</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-stone-600">
          <span className="font-medium">{dataset.country}</span> • {dataset.license}
        </div>
        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
          View Details
        </button>
      </div>
    </div>
  )
}