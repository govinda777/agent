import { apiClient } from './api-client';
import { getAuthToken } from './token-manager';

export interface ProfileData {
  llmProvider: string;
  llmApiKey: string;
}

export const ProfileService = {
  getProfile: async () => {
    const token = await getAuthToken();
    return apiClient<ProfileData>('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateProfile: async (data: Partial<ProfileData>) => {
    const token = await getAuthToken();
    return apiClient<ProfileData>('/api/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
};
