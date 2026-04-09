// src/hooks/useOrganization.js
import { useQuery, useMutation } from '@tanstack/react-query'
import { organizationsApi } from '../api/organizations.api'
import { queryClient } from '../lib/queryClient'

const orgKey = (slug) => ['organization', slug]
const orgMembersKey = (slug) => ['organization', slug, 'members']

export function useOrganization(slug) {
  // Fetch organization profile
  const {
    data: organization,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: orgKey(slug),
    queryFn: () => organizationsApi.get(slug).then((res) => res.data),
    enabled: !!slug,
  })

  // Fetch organization members
  const {
    data: members,
    isLoading: isMembersLoading,
  } = useQuery({
    queryKey: orgMembersKey(slug),
    queryFn: () => organizationsApi.getMembers(slug).then((res) => res.data),
    enabled: !!slug,
  })

  // Create a new organization
  const createOrgMutation = useMutation({
    mutationFn: (data) => organizationsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })

  // Update organization details
  const updateOrgMutation = useMutation({
    mutationFn: (data) => organizationsApi.update(slug, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKey(slug) })
    },
  })

  // Invite a new member
  const inviteMemberMutation = useMutation({
    mutationFn: (data) => organizationsApi.inviteMember(slug, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgMembersKey(slug) })
    },
  })

  // Remove a member
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => organizationsApi.removeMember(slug, userId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgMembersKey(slug) })
    },
  })

  return {
    // Organization data
    organization,
    isLoading,
    isError,
    error,

    // Members
    members: members ?? [],
    isMembersLoading,

    // Create org
    createOrg: createOrgMutation.mutate,
    isCreating: createOrgMutation.isPending,
    createError: createOrgMutation.error,

    // Update org
    updateOrg: updateOrgMutation.mutate,
    isUpdating: updateOrgMutation.isPending,
    updateError: updateOrgMutation.error,

    // Invite member
    inviteMember: inviteMemberMutation.mutate,
    isInviting: inviteMemberMutation.isPending,
    inviteError: inviteMemberMutation.error,

    // Remove member
    removeMember: removeMemberMutation.mutate,
    isRemoving: removeMemberMutation.isPending,
    removeError: removeMemberMutation.error,
  }
}
