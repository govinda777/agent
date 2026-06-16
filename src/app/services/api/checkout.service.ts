import { apiClient } from './api-client';
import { getAuthToken } from './token-manager';

export interface CheckoutResponse {
  url: string;
}

export const CheckoutService = {
  createSession: async (data: { productName: string; amountInCents: number; email?: string }) => {
    const token = await getAuthToken();
    return apiClient<CheckoutResponse>('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  verifySession: async (sessionId: string) => {
    const token = await getAuthToken();
    return apiClient<unknown>('/api/checkout/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId }),
    });
  },
};
