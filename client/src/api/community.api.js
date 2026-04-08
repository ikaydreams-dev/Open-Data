import { apiClient } from './client'

export const communityApi = {
  listDiscussions: (params) => apiClient.get('/discussions', { params }),
  getDiscussion: (id) => apiClient.get(`/discussions/${id}`),
  createDiscussion: (data) => apiClient.post('/discussions', data),
  updateDiscussion: (id, data) => apiClient.put(`/discussions/${id}`, data),
  deleteDiscussion: (id) => apiClient.delete(`/discussions/${id}`),
  getComments: (discussionId) => apiClient.get(`/discussions/${discussionId}/comments`),
  createComment: (discussionId, data) => apiClient.post(`/discussions/${discussionId}/comments`, data),
  updateComment: (discussionId, commentId, data) => apiClient.put(`/discussions/${discussionId}/comments/${commentId}`, data),
  deleteComment: (discussionId, commentId) => apiClient.delete(`/discussions/${discussionId}/comments/${commentId}`),
}
