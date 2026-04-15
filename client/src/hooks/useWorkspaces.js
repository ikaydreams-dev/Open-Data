import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { workspacesApi } from '../api/workspaces.api'

const QUERY_KEY = (userId) => ['workspaces', userId]

export function useWorkspaces() {
    const { user } = useAuthStore()
    const userId = user?._id
    const queryClient = useQueryClient()

    const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) })

    // List all workspaces
    const { data, isLoading, isError } = useQuery({
        queryKey: QUERY_KEY(userId),
                                                  queryFn: () => workspacesApi.list(userId).then((r) => r.data),
                                                  enabled: !!userId,
    })

    // Create
    const createMutation = useMutation({
        mutationFn: (payload) => workspacesApi.create(userId, payload),
                                       onSuccess: invalidate,
    })

    // Update
    const updateMutation = useMutation({
        mutationFn: ({ id, ...patch }) => workspacesApi.update(userId, id, patch),
                                       onSuccess: invalidate,
    })

    // Delete
    const deleteMutation = useMutation({
        mutationFn: (id) => workspacesApi.delete(userId, id),
                                       onSuccess: invalidate,
    })

    // Add dataset
    const addDatasetMutation = useMutation({
        mutationFn: ({ workspaceId, dataset }) =>
        workspacesApi.addDataset(userId, workspaceId, dataset),
                                           onSuccess: invalidate,
    })

    // Remove dataset
    const removeDatasetMutation = useMutation({
        mutationFn: ({ workspaceId, slug }) =>
        workspacesApi.removeDataset(userId, workspaceId, slug),
                                              onSuccess: invalidate,
    })

    return {
        workspaces: data ?? [],
        isLoading,
        isError,

        createWorkspace: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateWorkspace: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteWorkspace: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,

        addDataset: addDatasetMutation.mutateAsync,
        isAddingDataset: addDatasetMutation.isPending,

        removeDataset: removeDatasetMutation.mutateAsync,
        isRemovingDataset: removeDatasetMutation.isPending,
    }
}

/** Single-workspace hook — used inside WorkspaceDetail */
export function useWorkspace(workspaceId) {
    const { user } = useAuthStore()
    const userId = user?._id

    return useQuery({
        queryKey: ['workspace', userId, workspaceId],
        queryFn: () => workspacesApi.get(userId, workspaceId).then((r) => r.data),
                    enabled: !!userId && !!workspaceId,
    })
}
