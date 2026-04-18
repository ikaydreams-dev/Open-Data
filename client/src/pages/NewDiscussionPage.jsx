import { useState } from 'react'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { RichTextEditor } from '../components/community/RichTextEditor'
import { MentionAutocomplete } from '../components/community/MentionAutocomplete'

export function NewDiscussionPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      console.log('New Discussion:', { title: title.trim(), content: content.trim() })
      // In a real app, this would submit to API
      setTitle('')
      setContent('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">
          Start a New Discussion
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Discussion Title"
            placeholder="Enter a clear, descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Content
            </label>
            <MentionAutocomplete
              value={content}
              onChange={setContent}
              placeholder="Share your thoughts, ask questions, or start a conversation..."
            />
          </div>

          <Button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="w-full"
          >
            Create Discussion
          </Button>
        </form>
      </div>
    </div>
  )
}