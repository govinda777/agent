'use client';

import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { AuthProvider } from '../hooks/useAuth';
import { AuthContextType } from '../domain/AuthContext';
import { env } from '@/config/env';

function PrivyConsumer({ children }: { children: React.ReactNode }) {
  const privy = usePrivy();

  const authValue: AuthContextType = {
    ready: privy.ready,
    authenticated: privy.authenticated,
    user: privy.user ? {
      id: privy.user.id,
      email: privy.user.email ? { address: privy.user.email.address } : undefined,
    } : null,
    login: privy.login,
    logout: privy.logout,
    getAccessToken: async () => privy.getAccessToken(),
  };

  return <AuthProvider value={authValue}>{children}</AuthProvider>;
}

export function RealAuthProvider({ children }: { children: React.ReactNode }) {
  const appId = env.privyAppIdPublic;

  if (!appId) {
    const fallbackValue: AuthContextType = {
      ready: true,
      authenticated: false,
      user: null,
      login: () => {},
      logout: () => {},
      getAccessToken: async () => '',
    };
    return <AuthProvider value={fallbackValue}>{children}</AuthProvider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#2563EB',
          logo: 'https://placehold.co/400x100?text=Govinda+Systems',
        },
      }}
    >
      <PrivyConsumer>{children}</PrivyConsumer>
    </PrivyProvider>
  );
}
