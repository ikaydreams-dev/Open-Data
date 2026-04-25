import { User, Calendar } from 'lucide-react'

export function CommentItem({ comment, depth = 0 }) {
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
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-stone-200 pl-4' : ''}`}>
      <div className="bg-stone-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-stone-600" />
          <span className="font-medium text-stone-900">{comment.author}</span>
          <span className="text-stone-500 text-sm">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p className="text-stone-700 leading-relaxed">
          {comment.content}
        </p>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}