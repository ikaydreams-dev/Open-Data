import React, { useState } from 'react'

/**
 * NewDiscussionForm allows users to submit a new discussion thread.
 */
export function NewDiscussionForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [content, setContent] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle || !trimmedContent) return

    onSubmit?.({
      title: trimmedTitle,
      category,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    })

    setTitle('')
    setContent('')
    setCategory('General')
  }

  return (
    <form className="new-discussion-form" onSubmit={handleSubmit}>
      <h3 className="new-discussion-form__title">Start a new discussion</h3>

      <label className="new-discussion-form__label" htmlFor="discussion-title">
        Discussion title
      </label>
      <input
        id="discussion-title"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Enter discussion title"
        className="new-discussion-form__input"
        required
      />

      <label className="new-discussion-form__label" htmlFor="discussion-category">
        Category
      </label>
      <select
        id="discussion-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="new-discussion-form__select"
      >
        <option value="General">General</option>
        <option value="Announcements">Announcements</option>
        <option value="Feedback">Feedback</option>
        <option value="Help">Help</option>
      </select>

      <label className="new-discussion-form__label" htmlFor="discussion-content">
        Discussion content
      </label>
      <textarea
        id="discussion-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share your idea or question..."
        className="new-discussion-form__textarea"
        rows={6}
        required
      />

      <button type="submit" className="new-discussion-form__submit">
        Create Discussion
      </button>
    </form>
  )
}
