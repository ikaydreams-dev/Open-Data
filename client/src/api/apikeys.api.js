import { apiClient } from './client'

export const apiKeysApi = {
  list: () => apiClient.get('/api-keys'),
  create: (data) => apiClient.post('/api-keys', data),
  revoke: (id) => apiClient.delete(`/api-keys/${id}`),
}
