import { apiClient } from './api-client';
import { getAuthToken } from './token-manager';

export interface TenantStatusResponse {
  status: string;
}

export const TenantService = {
  getStatus: async () => {
    const token = await getAuthToken();
    return apiClient<TenantStatusResponse>('/api/tenant', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
