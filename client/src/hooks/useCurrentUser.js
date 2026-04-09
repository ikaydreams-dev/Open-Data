// src/hooks/useCurrentUser.js
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users.api'
import { queryClient } from '../lib/queryClient'

const CURRENT_USER_KEY = ['currentUser']

export function useCurrentUser() {
  const { user: authUser, isAuthenticated, updateUser } = useAuthStore()

  // Fetch full profile from the server using the username in the auth store
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: () => usersApi.getProfile(authUser.username).then((res) => res.data),
    enabled: isAuthenticated && !!authUser?.username,
  })

  // Update profile (name, bio, etc.)
  const updateProfileMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data).then((res) => res.data),
    onSuccess: (updatedUser) => {
      // Sync changes back into the auth store so the UI reflects immediately
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY })
    },
  })

  // Upload avatar image
  const uploadAvatarMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return usersApi.uploadAvatar(formData).then((res) => res.data)
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY })
    },
  })

  return {
    // Profile data — falls back to authUser while query loads
    profile: profile ?? authUser,
    isLoading,
    isError,
    error,

    // Update profile
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,

    // Upload avatar
    uploadAvatar: uploadAvatarMutation.mutate,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,
  }
}
