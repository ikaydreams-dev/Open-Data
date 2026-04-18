import { CommentList } from './CommentList'
import { Badge } from '../shared/Badge'
import { User, Calendar } from 'lucide-react'

export function DiscussionThread({ discussion }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-stone-200">
      {/* Discussion Header */}
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-stone-900">
            {discussion.title}
          </h1>
          <Badge variant="primary">{discussion.category}</Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
          <div className="flex items-center gap-1">
            <User size={16} />
            {discussion.author}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            {formatDate(discussion.createdAt)}
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed">
            {discussion.content}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-6">
        <CommentList comments={discussion.comments} />
      </div>
    </div>
  )
}