import { apiClient } from './api-client';
import { getAuthToken } from './token-manager';

export const AuthService = {
  syncUser: async () => {
    const token = await getAuthToken();
    return apiClient<unknown>('/api/auth/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
