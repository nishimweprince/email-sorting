import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const authApi = {
  getCurrentUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
  getGoogleAuthUrl: () => `${API_URL}/api/auth/google`,
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; description: string; color?: string }) =>
    api.post('/categories', data),
  update: (id: string, data: Partial<{ name: string; description: string; color: string }>) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Emails
export const emailsApi = {
  getAll: (params?: {
    categoryId?: string;
    accountEmail?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/emails', { params }),
  getById: (id: string) => api.get(`/emails/${id}`),
  getByCategory: (categoryId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/emails/category/${categoryId}`, { params }),
  delete: (id: string) => api.delete(`/emails/${id}`),
  bulkDelete: (emailIds: string[]) => api.post('/emails/bulk-delete', { emailIds }),
};

// Processing
export const processApi = {
  syncEmails: (maxResults?: number) => api.post('/process/sync', { maxResults }),
  categorizeEmail: (emailId: string) => api.post('/process/categorize', { emailId }),
  unsubscribe: (emailId: string) => api.post('/process/unsubscribe', { emailId }),
  bulkUnsubscribe: (emailIds: string[]) =>
    api.post('/process/bulk-unsubscribe', { emailIds }),
};
