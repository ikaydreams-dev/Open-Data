import { apiClient } from './client'

export const organizationsApi = {
  get: (slug) => apiClient.get(`/organizations/${slug}`),
  create: (data) => apiClient.post('/organizations', data),
  update: (slug, data) => apiClient.put(`/organizations/${slug}`, data),
  getMembers: (slug) => apiClient.get(`/organizations/${slug}/members`),
  inviteMember: (slug, data) => apiClient.post(`/organizations/${slug}/members`, data),
  removeMember: (slug, userId) => apiClient.delete(`/organizations/${slug}/members/${userId}`),
}
