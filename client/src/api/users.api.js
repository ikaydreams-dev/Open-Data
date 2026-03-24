import { apiClient } from './client'

export const usersApi = {
  getProfile: (username) => apiClient.get(`/users/${username}`),
  updateProfile: (data) => apiClient.put('/users/me', data),
  uploadAvatar: (formData) => apiClient.post('/users/me/avatar', formData),
  getUserDatasets: (username, params) => apiClient.get(`/users/${username}/datasets`, { params }),
}
