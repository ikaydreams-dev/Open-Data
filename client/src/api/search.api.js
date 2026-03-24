import { apiClient } from './client'

export const searchApi = {
  search: (params) => apiClient.get('/search', { params }),
  autocomplete: (q) => apiClient.get('/search/autocomplete', { params: { q } }),
}
