// src/components/workspaces/WorkspaceCreateForm.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { workspacesApi } from '../../api/workspaces.api'
import { queryClient } from '../../lib/queryClient'
import { Input } from '../shared/Input'
import { Button } from '../shared/Button'
import { Select } from '../shared/Select'
import { Textarea } from '../shared/Textarea'
import { RadioGroup } from '../shared/RadioGroup'
import toast from 'react-hot-toast'

const LANGUAGE_OPTIONS = [
  {
    value: 'python',
    label: 'Python',
    description: 'Best for data science, ML/AI, and general analysis',
  },
  {
    value: 'r',
    label: 'R',
    description: 'Statistical computing and data visualisation',
  },
  {
    value: 'sql',
    label: 'SQL',
    description: 'Query and explore structured datasets directly',
  },
]

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', description: 'Only you can see this workspace' },
  { value: 'public',  label: 'Public',  description: 'Visible to everyone on the platform' },
]

const INITIAL_STATE = {
  title:       '',
  description: '',
  language:    'python',
  visibility:  'private',
}

export function WorkspaceCreateForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(INITIAL_STATE)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim())           next.title = 'Workspace name is required.'
    if (form.title.trim().length > 80) next.title = 'Name must be 80 characters or fewer.'
    return next
  }

  const createMutation = useMutation({
    mutationFn: (data) => workspacesApi.create(data).then((res) => res.data),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace created!')
      if (onSuccess) {
        onSuccess(workspace)
      } else {
        navigate(`/workspaces/${workspace.id}`)
      }
    },
    onError: () => {
      toast.error('Failed to create workspace. Please try again.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
    createMutation.mutate({
      title:       form.title.trim(),
      description: form.description.trim(),
      language:    form.language,
      visibility:  form.visibility,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <Input
        label="Workspace name"
        placeholder="e.g. Kenya Crop Yield Analysis"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
        required
        maxLength={80}
        hint={`${form.title.length}/80`}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="What will you explore in this workspace?"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        rows={3}
        hint="Optional — helps others understand the purpose of this workspace."
      />

      {/* Language */}
      <RadioGroup
        label="Language"
        options={LANGUAGE_OPTIONS}
        value={form.language}
        onChange={(val) => set('language', val)}
        orientation="vertical"
        required
      />

      {/* Visibility */}
      <RadioGroup
        label="Visibility"
        options={VISIBILITY_OPTIONS}
        value={form.visibility}
        onChange={(val) => set('visibility', val)}
        orientation="horizontal"
        required
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={createMutation.isPending}
        >
          Create workspace
        </Button>
      </div>
    </form>
  )
}
