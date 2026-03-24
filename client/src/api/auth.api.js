import { apiClient } from './client'

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: () => apiClient.post('/auth/refresh'),
  verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
  resendVerification: () => apiClient.post('/auth/resend-verification'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password }),
  me: () => apiClient.get('/auth/me'),
}
