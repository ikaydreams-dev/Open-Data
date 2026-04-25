import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare, Pencil, Trash2, Reply, CornerDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { communityApi } from '../../api/community.api'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/shared/Button'
import { Textarea } from '../../components/shared/Textarea'
import { PageSpinner } from '../../components/shared/Spinner'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'

function CommentItem({ comment, discussionId, onReply, currentUserId, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body)
  const [showDelete, setShowDelete] = useState(false)
  const queryClient = useQueryClient()

  const isOwner = currentUserId === comment.user?._id

  const updateMutation = useMutation({
    mutationFn: (body) => communityApi.updateComment(discussionId, comment._id, { body }),
    onSuccess: () => {
      toast.success('Comment updated')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['discussion-comments', discussionId] })
    },
    onError: () => toast.error('Failed to update comment'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => communityApi.deleteComment(discussionId, comment._id),
    onSuccess: () => {
      toast.success('Comment deleted')
      setShowDelete(false)
      queryClient.invalidateQueries({ queryKey: ['discussion-comments', discussionId] })
    },
    onError: () => toast.error('Failed to delete comment'),
  })

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editBody.trim()) return
    updateMutation.mutate(editBody)
  }

  return (
    <div className="group">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {comment.user?.avatar?.url ? (
            <img src={comment.user.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-medium text-sm">
              {comment.user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-stone-800">{comment.user?.name || 'Anonymous'}</span>
            <span className="text-xs text-stone-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && <span className="text-xs text-stone-400">(edited)</span>}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2">
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={updateMutation.isPending}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{comment.body}</p>
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onReply(comment)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-orange-700"
                >
                  <Reply size={12} /> Reply
                </button>
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-orange-700"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}
                {(isOwner || isAdmin) && (
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-600"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-8 mt-4 space-y-4 border-l-2 border-stone-100 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              discussionId={discussionId}
              onReply={onReply}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Comment"
        message="This will permanently delete this comment. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

export default function DiscussionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [showDeleteDiscussion, setShowDeleteDiscussion] = useState(false)

  // Fetch discussion
  const { data: discussion, isLoading, isError } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => communityApi.getDiscussion(id).then((r) => r.data),
    retry: false,
    onError: () => navigate('/404'),
  })

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ['discussion-comments', id],
    queryFn: () => communityApi.getComments(id).then((r) => r.data),
    enabled: !!discussion,
  })

  // Create comment
  const commentMutation = useMutation({
    mutationFn: (data) => communityApi.createComment(id, data),
    onSuccess: () => {
      toast.success(replyingTo ? 'Reply posted' : 'Comment posted')
      setNewComment('')
      setReplyingTo(null)
      queryClient.invalidateQueries({ queryKey: ['discussion-comments', id] })
      queryClient.invalidateQueries({ queryKey: ['discussion', id] })
    },
    onError: () => toast.error('Failed to post comment'),
  })

  // Delete discussion
  const deleteMutation = useMutation({
    mutationFn: () => communityApi.deleteDiscussion(id),
    onSuccess: () => {
      toast.success('Discussion deleted')
      navigate(-1)
    },
    onError: () => toast.error('Failed to delete discussion'),
  })

  function handleSubmitComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return toast.error('Please enter a comment')
    commentMutation.mutate({
      body: newComment,
      parentComment: replyingTo?._id,
    })
  }

  function handleReply(comment) {
    setReplyingTo(comment)
    document.getElementById('comment-input')?.focus()
  }

  if (isLoading) return <PageSpinner />
  if (isError || !discussion) return null

  const comments = commentsData?.comments ?? []
  const isOwner = user?._id === discussion.user?._id
  const isAdmin = user?.role === 'admin'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to={discussion.dataset ? `/datasets/${discussion.dataset.slug}` : '/community'}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-700 mb-6"
      >
        <ArrowLeft size={14} />
        Back to {discussion.dataset ? discussion.dataset.title : 'Discussions'}
      </Link>

      {/* Discussion header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-xl font-bold text-stone-900">{discussion.title}</h1>
          {(isOwner || isAdmin) && (
            <div className="flex gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteDiscussion(true)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-stone-500 mb-4">
          <span>Started by <span className="font-medium text-stone-700">{discussion.user?.name || 'Anonymous'}</span></span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MessageSquare size={14} />
            {discussion.commentCount || 0} {discussion.commentCount === 1 ? 'reply' : 'replies'}
          </span>
        </div>

        {discussion.body && (
          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
            <p className="text-sm text-stone-700 whitespace-pre-wrap">{discussion.body}</p>
          </div>
        )}
      </div>

      {/* Comments section */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-stone-800">
          {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {comments.length === 0 ? (
          <p className="text-sm text-stone-400 py-4">No replies yet. Be the first to respond!</p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                discussionId={id}
                onReply={handleReply}
                currentUserId={user?._id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* Comment form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="mt-8 pt-6 border-t border-stone-200">
            {replyingTo && (
              <div className="flex items-center gap-2 mb-3 text-sm text-stone-600">
                <CornerDownRight size={14} />
                <span>Replying to <span className="font-medium">{replyingTo.user?.name}</span></span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-orange-700 hover:text-orange-800"
                >
                  Cancel
                </button>
              </div>
            )}
            <Textarea
              id="comment-input"
              placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <Button type="submit" loading={commentMutation.isPending}>
                <MessageSquare size={14} /> Post {replyingTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-500 mb-3">Sign in to join the discussion</p>
            <Button onClick={() => navigate('/sign-in')}>Sign In</Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDiscussion}
        onClose={() => setShowDeleteDiscussion(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Discussion"
        message="This will permanently delete this discussion and all its comments. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
