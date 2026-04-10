import React, { useState } from 'react'

/**
 * CommentSection renders a list of comments and a form for adding a new comment.
 */
export function CommentSection({ comments = [], onAddComment }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    onAddComment?.({ content: trimmedMessage, createdAt: new Date().toISOString() })
    setMessage('')
  }

  return (
    <section className="comment-section">
      <h4 className="comment-section__title">Comments ({comments.length})</h4>

      {comments.length === 0 ? (
        <p className="comment-section__empty">No comments yet. Be the first to reply.</p>
      ) : (
        <ul className="comment-section__list">
          {comments.map((comment, index) => (
            <li key={comment.id || index} className="comment-section__item">
              <div className="comment-section__body">
                <p>{comment.content}</p>
              </div>
              <div className="comment-section__meta">
                <span>{comment.author?.name || 'Anonymous'}</span>
                {comment.createdAt && (
                  <time dateTime={comment.createdAt}> 
                    {new Date(comment.createdAt).toLocaleString()}
                  </time>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="comment-section__form" onSubmit={handleSubmit}>
        <label htmlFor="comment-input" className="sr-only">
          Add a comment
        </label>
        <textarea
          id="comment-input"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a comment..."
          className="comment-section__textarea"
          rows={4}
        />
        <button type="submit" className="comment-section__submit">
          Post Comment
        </button>
      </form>
    </section>
  )
}
