import { useState } from 'react'
import { Button } from '../shared/Button'
import { Textarea } from '../shared/Textarea'

export function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      // In a real app, this would call an API
      console.log('New comment:', content)
      // For now, just log and clear
      setContent('')
      // If onSubmit prop, call it
      onSubmit?.(content)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-stone-200 pt-6">
      <h4 className="text-md font-medium text-stone-900 mb-3">
        Add a comment
      </h4>

      <Textarea
        placeholder="Write your comment here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="mb-3"
      />

      <Button type="submit" disabled={!content.trim()}>
        Post Comment
      </Button>
    </form>
  )
}