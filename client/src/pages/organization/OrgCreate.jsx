// src/pages/organization/OrgCreate.jsx
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { organizationsApi } from '../../api/organizations.api'
import { usePermissions } from '../../hooks/usePermissions'
import { Input } from '../../components/shared/Input'
import { Textarea } from '../../components/shared/Textarea'
import { Select } from '../../components/shared/Select'
import { Button } from '../../components/shared/Button'

const ORG_TYPES = [
  { value: 'university', label: 'University / Research Institution' },
  { value: 'government', label: 'Government Agency' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'company', label: 'Tech Company / Startup' },
  { value: 'other', label: 'Other' },
]

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function OrgCreatePage() {
  const navigate = useNavigate()
  const { can } = usePermissions()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', slug: '', type: '', description: '', website: '' },
  })

  // Auto-generate slug from name as the user types
  function handleNameChange(e) {
    const name = e.target.value
    setValue('name', name)
    setValue('slug', slugify(name))
  }

  const createMutation = useMutation({
    mutationFn: (data) => organizationsApi.create(data),
    onSuccess: (res) => {
      toast.success('Organization created')
      navigate(`/organizations/${res.data.slug}`)
    },
    onError: () => toast.error('Failed to create organization'),
  })

  // Permission gate — only admin and institution roles can create orgs
  if (!can('CREATE_ORGANIZATION')) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Building2 size={24} className="text-stone-400" />
        </div>
        <h2 className="text-base font-semibold text-stone-800 mb-1">Permission Required</h2>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          You don't have permission to create organizations. This is available to admins and institutions.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Create Organization</h1>
        <p className="text-sm text-stone-500 mt-1">
          Organizations let you group datasets and collaborate with your team.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        className="space-y-5"
      >
        <Input
          label="Organization Name"
          required
          placeholder="e.g. Ghana Statistical Service"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
          })}
          onChange={handleNameChange}
        />

        <Input
          label="Handle / Slug"
          required
          placeholder="e.g. ghana-statistical-service"
          hint="Your organization's URL: /organizations/your-handle"
          error={errors.slug?.message}
          {...register('slug', {
            required: 'Handle is required',
            pattern: {
              value: /^[a-z0-9-]+$/,
              message: 'Only lowercase letters, numbers, and hyphens',
            },
          })}
        />

        <Select
          label="Organization Type"
          required
          placeholder="Select a type"
          options={ORG_TYPES}
          error={errors.type?.message}
          {...register('type', { required: 'Please select a type' })}
        />

        <Textarea
          label="Description"
          placeholder="What does your organization do?"
          rows={3}
          {...register('description')}
        />

        <Input
          label="Website"
          type="url"
          placeholder="https://yourorg.org"
          error={errors.website?.message}
          {...register('website', {
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Must be a valid URL starting with http(s)://',
            },
          })}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={createMutation.isPending}>
            Create Organization
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
