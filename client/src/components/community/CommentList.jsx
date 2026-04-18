import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'

export function CommentList({ comments }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">
        Comments ({comments.length})
      </h3>

      <div className="space-y-6 mb-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      <CommentForm />
    </div>
  )
}