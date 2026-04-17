// src/hooks/useApiKeys.js
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiKeysApi } from '../api/apikeys.api'
import { queryClient } from '../lib/queryClient'

const API_KEYS_KEY = ['apiKeys']

export function useApiKeys() {
  // Fetch all API keys for the current user
  const {
    data: apiKeys,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: API_KEYS_KEY,
    queryFn: () => apiKeysApi.list().then((res) => res.data),
  })

  // Create a new API key
  const createKeyMutation = useMutation({
    mutationFn: (data) => apiKeysApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_KEY })
    },
  })

  // Revoke (delete) an API key by id
  const revokeKeyMutation = useMutation({
    mutationFn: (id) => apiKeysApi.revoke(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_KEY })
    },
  })

  return {
    // API keys list
    apiKeys: apiKeys ?? [],
    isLoading,
    isError,
    error,

    // Create key
    createKey: createKeyMutation.mutate,
    isCreating: createKeyMutation.isPending,
    createError: createKeyMutation.error,
    // The newly created key is returned here — important to show the user once
    // since raw key values are typically not stored or shown again
    newKey: createKeyMutation.data ?? null,

    // Revoke key
    revokeKey: revokeKeyMutation.mutate,
    isRevoking: revokeKeyMutation.isPending,
    revokeError: revokeKeyMutation.error,
  }
}
