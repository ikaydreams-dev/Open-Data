// src/pages/organization/OrgEdit.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { organizationsApi } from '../../api/organizations.api'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/shared/Input'
import { Textarea } from '../../components/shared/Textarea'
import { Button } from '../../components/shared/Button'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'

export default function OrgEditPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Fetch org details
  const { data: org, isLoading: orgLoading, isError } = useQuery({
    queryKey: ['org', slug],
    queryFn: () => organizationsApi.get(slug).then((r) => r.data),
    retry: false,
  })

  // Fetch members to check if current user is an org admin
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['org-members', slug],
    queryFn: () => organizationsApi.getMembers(slug).then((r) => r.data),
    enabled: !!org,
  })

  const members = membersData?.members ?? []
  const isOrgAdmin = members.some((m) => m._id === user?._id && m.orgRole === 'admin')
  const isPlatformAdmin = user?.role === 'admin'
  const canEdit = isOrgAdmin || isPlatformAdmin

  // Use `values` so the form rehydrates once org data loads
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: {
      name: org?.name ?? '',
      description: org?.description ?? '',
      website: org?.website ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => organizationsApi.update(slug, data),
    onSuccess: (res) => {
      toast.success('Organization updated')
      navigate(`/organizations/${res.data?.slug ?? slug}`)
    },
    onError: () => toast.error('Failed to update organization'),
  })

  if (orgLoading || membersLoading) return <PageSpinner />

  if (isError || !org) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={Building2}
          title="Organization not found"
          description={`No organization exists at "${slug}".`}
        />
      </div>
    )
  }

  // Permission gate — checked after data loads so we don't flash the error
  if (!canEdit) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Building2 size={24} className="text-stone-400" />
        </div>
        <h2 className="text-base font-semibold text-stone-800 mb-1">Access Denied</h2>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Only organization admins can edit this page.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Edit Organization</h1>
        <p className="text-sm text-stone-500 mt-1">
          Update the details for{' '}
          <span className="font-medium text-stone-700">{org.name}</span>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
        className="space-y-5"
      >
        <Input
          label="Organization Name"
          required
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
          })}
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
          <Button type="submit" loading={updateMutation.isPending}>
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/organizations/${slug}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
