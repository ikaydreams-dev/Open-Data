// src/components/workspaces/WorkspaceShareModal.jsx
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { UserPlus, Trash2, Loader, Globe, Lock, ChevronDown } from 'lucide-react'
import { workspacesApi } from '../../api/workspaces.api'
import { queryClient } from '../../lib/queryClient'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const sharesKey = (id) => ['workspace', id, 'shares']

const PERMISSION_LABELS = {
  view: { label: 'Can view', description: 'Read-only access to the notebook' },
  edit: { label: 'Can edit', description: 'Can read and modify the notebook' },
}

// Small inline select for permission level
function PermissionSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border',
          'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-orange-500',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {PERMISSION_LABELS[value]?.label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
          {Object.entries(PERMISSION_LABELS).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors',
                value === key && 'bg-orange-50',
              )}
            >
              <p className={cn('text-xs font-medium', value === key ? 'text-orange-700' : 'text-stone-800')}>
                {cfg.label}
              </p>
              <p className="text-xs text-stone-400">{cfg.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function WorkspaceShareModal({ open, onClose, workspace }) {
  const workspaceId = workspace?.id
  const [inviteUsername, setInviteUsername] = useState('')
  const [invitePermission, setInvitePermission] = useState('view')
  const [inviteError, setInviteError] = useState(null)

  // ── Fetch current shares ───────────────────────────────────────────────────
  const { data: shares = [], isLoading } = useQuery({
    queryKey: sharesKey(workspaceId),
    queryFn: () => workspacesApi.getShares(workspaceId).then((r) => r.data),
    enabled: open && !!workspaceId,
  })

  // ── Add share ──────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: () =>
      workspacesApi.addShare(workspaceId, {
        username: inviteUsername.trim(),
        permission: invitePermission,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharesKey(workspaceId) })
      setInviteUsername('')
      setInvitePermission('view')
      toast.success('Collaborator added.')
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'User not found or already has access.'
      setInviteError(msg)
    },
  })

  // ── Update permission ──────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ userId, permission }) =>
      workspacesApi.updateShare(workspaceId, userId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharesKey(workspaceId) })
    },
    onError: () => toast.error('Failed to update permission.'),
  })

  // ── Remove share ───────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (userId) => workspacesApi.removeShare(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharesKey(workspaceId) })
      toast.success('Collaborator removed.')
    },
    onError: () => toast.error('Failed to remove collaborator.'),
  })

  const handleInvite = (e) => {
    e.preventDefault()
    setInviteError(null)
    if (!inviteUsername.trim()) {
      setInviteError('Please enter a username.')
      return
    }
    addMutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} title="Share workspace" size="md">
      <div className="flex flex-col gap-5">
        {/* Visibility indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
          {workspace?.visibility === 'public' ? (
            <>
              <Globe size={15} className="text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-medium text-stone-800">Public workspace</p>
                <p className="text-xs text-stone-500">Anyone with the link can view this workspace.</p>
              </div>
            </>
          ) : (
            <>
              <Lock size={15} className="text-stone-500 shrink-0" />
              <div>
                <p className="text-xs font-medium text-stone-800">Private workspace</p>
                <p className="text-xs text-stone-500">Only you and invited collaborators can access this.</p>
              </div>
            </>
          )}
        </div>

        {/* Invite form */}
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-700">Invite collaborator</p>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="Username"
                value={inviteUsername}
                onChange={(e) => {
                  setInviteUsername(e.target.value)
                  if (inviteError) setInviteError(null)
                }}
                error={inviteError}
              />
            </div>
            <PermissionSelect
              value={invitePermission}
              onChange={setInvitePermission}
              disabled={addMutation.isPending}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={addMutation.isPending}
              className="shrink-0"
            >
              <UserPlus size={14} /> Invite
            </Button>
          </div>
        </form>

        {/* Current collaborators */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-stone-700">
            Collaborators
            {shares.length > 0 && (
              <span className="ml-2 text-xs font-normal text-stone-400">{shares.length}</span>
            )}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader size={18} className="text-stone-400 animate-spin" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-sm text-stone-400 py-3 text-center">
              No collaborators yet. Invite someone above.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {shares.map((share) => (
                <li
                  key={share.userId}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-stone-100"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold shrink-0">
                    {share.name?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{share.name}</p>
                    <p className="text-xs text-stone-400 truncate">@{share.username}</p>
                  </div>

                  {/* Permission selector */}
                  <PermissionSelect
                    value={share.permission}
                    onChange={(permission) =>
                      updateMutation.mutate({ userId: share.userId, permission })
                    }
                    disabled={updateMutation.isPending || removeMutation.isPending}
                  />

                  {/* Remove */}
                  <button
                    onClick={() => removeMutation.mutate(share.userId)}
                    disabled={removeMutation.isPending}
                    className="p-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title="Remove collaborator"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
