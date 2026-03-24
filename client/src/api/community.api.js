import { apiClient } from './client'

export const communityApi = {
  listDiscussions: (params) => apiClient.get('/discussions', { params }),
  getDiscussion: (id) => apiClient.get(`/discussions/${id}`),
  createDiscussion: (data) => apiClient.post('/discussions', data),
  getComments: (discussionId) => apiClient.get(`/discussions/${discussionId}/comments`),
  createComment: (discussionId, data) => apiClient.post(`/discussions/${discussionId}/comments`, data),
  deleteComment: (discussionId, commentId) => apiClient.delete(`/discussions/${discussionId}/comments/${commentId}`),
}
