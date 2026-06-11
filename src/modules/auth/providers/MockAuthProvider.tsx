'use client';

import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { AuthContextType } from '../domain/AuthContext';

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const authValue: AuthContextType = {
    ready: true,
    authenticated: true,
    user: {
      id: 'did:privy:e2e-user',
      email: { address: 'e2e-test@govinda.com' },
    },
    login: () => {
      document.cookie = 'privy-token=mock-token-e2e-user; path=/; max-age=3600';
      window.localStorage.setItem('playwright-mock-auth', 'true');
      window.location.href = '/onboarding';
    },
    logout: () => {
      document.cookie = 'privy-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.localStorage.removeItem('playwright-mock-auth');
      window.location.href = '/login';
    },
    getAccessToken: async () => 'mock-token-e2e-user',
  };

  return <AuthProvider value={authValue}>{children}</AuthProvider>;
}
