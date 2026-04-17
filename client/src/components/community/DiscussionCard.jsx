import React from 'react'

/**
 * DiscussionCard displays an individual discussion preview.
 */
export function DiscussionCard({ discussion, onView }) {
  if (!discussion) return null

  const title = discussion.title || 'Untitled Discussion'
  const author = discussion.author?.name || discussion.createdBy || 'Unknown author'
  const date = discussion.createdAt ? new Date(discussion.createdAt).toLocaleDateString() : 'No date'
  const excerpt = discussion.content
    ? `${discussion.content.slice(0, 160)}${discussion.content.length > 160 ? '…' : ''}`
    : discussion.description || 'No discussion details provided.'
  const comments = discussion.commentsCount ?? discussion.comments?.length ?? 0
  const likes = discussion.likesCount ?? discussion.likes ?? 0

  return (
    <article className="discussion-card">
      <header className="discussion-card__header">
        <h3 className="discussion-card__title">{title}</h3>
        <div className="discussion-card__tags">
          {discussion.category && <span className="discussion-card__tag">{discussion.category}</span>}
        </div>
      </header>

      <p className="discussion-card__excerpt">{excerpt}</p>

      <footer className="discussion-card__footer">
        <div className="discussion-card__details">
          <span>{author}</span>
          <span>{date}</span>
        </div>
        <div className="discussion-card__stats">
          <span>{comments} comments</span>
          <span>{likes} likes</span>
        </div>
        {onView && (
          <button type="button" className="discussion-card__button" onClick={() => onView(discussion)}>
            View
          </button>
        )}
      </footer>
    </article>
  )
}
