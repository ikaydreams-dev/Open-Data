import { apiClient } from './client'

export const datasetsApi = {
  list: (params) => apiClient.get('/datasets', { params }),
  get: (slug) => apiClient.get(`/datasets/${slug}`),
  create: (data) => apiClient.post('/datasets', data),
  update: (slug, data) => apiClient.put(`/datasets/${slug}`, data),
  delete: (slug) => apiClient.delete(`/datasets/${slug}`),
  like: (slug) => apiClient.post(`/datasets/${slug}/like`),
  unlike: (slug) => apiClient.delete(`/datasets/${slug}/like`),
  download: (slug, fileId) => apiClient.get(`/datasets/${slug}/files/${fileId}/download`),
  getFilePreview: (slug, fileId) => apiClient.get(`/datasets/${slug}/files/${fileId}/preview`),
  getVersions: (slug) => apiClient.get(`/datasets/${slug}/versions`),
  getReviews: (slug) => apiClient.get(`/datasets/${slug}/reviews`),
  createReview: (slug, data) => apiClient.post(`/datasets/${slug}/reviews`, data),
  updateReview: (slug, reviewId, data) => apiClient.put(`/datasets/${slug}/reviews/${reviewId}`, data),
  deleteReview: (slug, reviewId) => apiClient.delete(`/datasets/${slug}/reviews/${reviewId}`),
}
