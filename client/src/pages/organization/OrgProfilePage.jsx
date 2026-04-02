import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Globe, Users, Database, UserMinus, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { organizationsApi } from '../../api/organizations.api'
import { datasetsApi } from '../../api/datasets.api'
import { useAuthStore } from '../../store/authStore'
import { DatasetCard } from '../../components/datasets/DatasetCard'
import { Pagination } from '../../components/shared/Pagination'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/shared/Input'
import { Modal } from '../../components/shared/Modal'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { formatNumber } from '../../lib/utils'

const TABS = ['Datasets', 'Members']
const roleVariant = { admin: 'danger', researcher: 'primary', contributor: 'info', institution: 'warning' }

export default function OrgProfilePage() {
  const { slug } = useParams()
  const { user: authUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('Datasets')
  const [page, setPage] = useState(1)
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
  const { data: membersData } = useQuery({
    queryKey: ['org-members', slug],
    queryFn: () => organizationsApi.getMembers(slug).then((r) => r.data),
    enabled: activeTab === 'Members' && !!org,
  })

  // Fetch org datasets
  const { data: datasetsData, isLoading: datasetsLoading } = useQuery({
    queryKey: ['org-datasets', slug, page],
    queryFn: () => datasetsApi.list({ organization: slug, page, limit: 12 }).then((r) => r.data),
    enabled: activeTab === 'Datasets' && !!org,
  })

  const datasets = datasetsData?.datasets ?? []
  const totalPages = datasetsData?.totalPages ?? 1
  const members = membersData?.members ?? []

  const isOrgAdmin = members.some((m) => m._id === authUser?._id && m.orgRole === 'admin')
  const isPlatformAdmin = authUser?.role === 'admin'
  const canManageMembers = isOrgAdmin || isPlatformAdmin

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

  if (orgLoading) return <PageSpinner />

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          {org.logo
            ? <img src={org.logo} alt={org.name} className="w-16 h-16 rounded-xl object-cover" />
            : <Building2 size={28} className="text-orange-700" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-900 mb-1">{org.name}</h1>
          {org.description && (
            <p className="text-sm text-stone-500 mb-3 max-w-xl">{org.description}</p>
          )}
          <div className="flex flex-wrap gap-5 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              <span className="font-semibold text-stone-800">{formatNumber(org.memberCount ?? 0)}</span> members
            </span>
            <span className="flex items-center gap-1.5">
              <Database size={14} />
              <span className="font-semibold text-stone-800">{formatNumber(org.datasetCount ?? 0)}</span> datasets
            </span>
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-orange-700 hover:underline"
              >
                <Globe size={14} /> {org.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Datasets Tab */}
      {activeTab === 'Datasets' && (
        datasetsLoading ? <PageSpinner /> :
        datasets.length === 0 ? (
          <EmptyState icon={Database} title="No datasets" description="This organization hasn't published any datasets yet." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {datasets.map((d) => <DatasetCard key={d._id ?? d.slug} dataset={d} />)}
            </div>
            <div className="flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )
      )}

      {/* Members Tab */}
      {activeTab === 'Members' && (
        <div>
          {canManageMembers && (
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus size={14} /> Invite Member
              </Button>
            </div>
          )}

          {members.length === 0 ? (
            <EmptyState icon={Users} title="No members" description="This organization has no members yet." />
          ) : (
            <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
              {members.map((member) => (
                <li key={member._id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-stone-50">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 text-xs font-bold uppercase shrink-0">
                    {member.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{member.name}</p>
                    <p className="text-xs text-stone-400">@{member.username}</p>
                  </div>
                  <Badge variant={roleVariant[member.role] ?? 'default'} className="capitalize shrink-0">
                    {member.role}
                  </Badge>
                  {canManageMembers && member._id !== authUser?._id && (
                    <button
                      onClick={() => setRemoveTarget(member)}
                      className="ml-2 text-stone-400 hover:text-red-500 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member" size="sm">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
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
