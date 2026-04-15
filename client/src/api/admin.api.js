import { apiClient } from './client'

export const adminApi = {
    getDashboardStats: () => apiClient.get('/admin/dashboard'),
    getPendingDatasets: (params) => apiClient.get('/admin/datasets/pending', { params }),
    moderateDataset: (slug, data) => apiClient.patch(`/admin/datasets/${slug}/moderate`, data),
    featureDataset: (slug, featured) => apiClient.patch(`/admin/datasets/${slug}/feature`, { featured }),
    listUsers: (params) => apiClient.get('/admin/users', { params }),
    updateUserRole: (userId, role) => apiClient.patch(`/admin/users/${userId}/role`, { role }),
}
