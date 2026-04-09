// src/pages/organization/OrgMembers.jsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserMinus } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { organizationsApi } from '../../api/organizations.api'
import { useAuthStore } from '../../store/authStore'
import { Table } from '../../components/shared/Table'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/shared/Input'
import { Modal } from '../../components/shared/Modal'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageSpinner } from '../../components/shared/Spinner'

const roleVariant = {
  admin: 'danger',
  researcher: 'primary',
  contributor: 'info',
  institution: 'warning',
}

export default function OrgMembersPage() {
  const { slug } = useParams()
  const { user: authUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [removeTarget, setRemoveTarget] = useState(null)

  // Fetch org
  const { data: org, isLoading: orgLoading, isError } = useQuery({
    queryKey: ['org', slug],
    queryFn: () => organizationsApi.get(slug).then((r) => r.data),
    retry: false,
  })

  // Fetch members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['org-members', slug],
    queryFn: () => organizationsApi.getMembers(slug).then((r) => r.data),
    enabled: !!org,
  })

  const members = membersData?.members ?? []
  const isOrgAdmin = members.some((m) => m._id === authUser?._id && m.orgRole === 'admin')
  const isPlatformAdmin = authUser?.role === 'admin'
  const canManage = isOrgAdmin || isPlatformAdmin

  // Invite member
  const inviteMutation = useMutation({
    mutationFn: () => organizationsApi.inviteMember(slug, { email: inviteEmail }),
    onSuccess: () => {
      toast.success('Invitation sent')
      setInviteOpen(false)
      setInviteEmail('')
      queryClient.invalidateQueries({ queryKey: ['org-members', slug] })
    },
    onError: () => toast.error('Failed to send invitation'),
  })

  // Remove member
  const removeMutation = useMutation({
    mutationFn: (userId) => organizationsApi.removeMember(slug, userId),
    onSuccess: () => {
      toast.success('Member removed')
      setRemoveTarget(null)
      queryClient.invalidateQueries({ queryKey: ['org-members', slug] })
    },
    onError: () => toast.error('Failed to remove member'),
  })

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 text-xs font-bold uppercase shrink-0">
            {row.name?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{row.name}</p>
            <p className="text-xs text-stone-400">@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Platform Role',
      render: (row) => (
        <Badge variant={roleVariant[row.role] ?? 'default'} className="capitalize">
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'orgRole',
      label: 'Org Role',
      render: (row) => (
        <Badge
          variant={row.orgRole === 'admin' ? 'danger' : 'default'}
          className="capitalize"
        >
          {row.orgRole ?? 'member'}
        </Badge>
      ),
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      render: (row) => (
        <span className="text-sm text-stone-500">
          {row.joinedAt ? format(new Date(row.joinedAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    // Actions column — only rendered for managers
    ...(canManage
      ? [
          {
            key: 'actions',
            label: '',
            render: (row) =>
              // Can't remove yourself
              row._id === authUser?._id ? null : (
                <div className="flex justify-end">
                  <button
                    onClick={() => setRemoveTarget(row)}
                    className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove member"
                  >
                    <UserMinus size={15} />
                  </button>
                </div>
              ),
          },
        ]
      : []),
  ]

  if (orgLoading) return <PageSpinner />

  if (isError || !org) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={Users}
          title="Organization not found"
          description={`No organization exists at "${slug}".`}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Members</h1>
          <p className="text-sm text-stone-500 mt-1">
            {org.name} ·{' '}
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} /> Invite Member
          </Button>
        )}
      </div>

      {/* Members Table */}
      {membersLoading ? (
        <PageSpinner />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="This organization has no members. Invite someone to get started."
          action={
            canManage ? (
              <button
                onClick={() => setInviteOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-700 text-white text-sm font-medium rounded-md hover:bg-orange-800 transition-colors"
              >
                <UserPlus size={14} /> Invite Member
              </button>
            ) : null
          }
        />
      ) : (
        <Table columns={columns} data={members} />
      )}

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Member"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={inviteMutation.isPending}
              onClick={() => inviteMutation.mutate()}
              disabled={!inviteEmail.trim()}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Confirm */}
      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeMutation.mutate(removeTarget._id)}
        title="Remove Member"
        message={`Remove ${removeTarget?.name} from ${org.name}? They will lose access to organization datasets.`}
        confirmLabel="Remove"
        danger
      />
    </div>
  )
}
