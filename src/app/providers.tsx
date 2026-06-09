'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { env } from '@/config/env';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Try using a format that looks like a real ID, e.g., 'cl...', or just use conditional rendering
  const appId = env.privyAppIdPublic;

  if (!appId) {
    // If we're building and don't have an ID, just render children to avoid build failures
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#2563EB', // blue-600
          logo: 'https://placehold.co/400x100?text=Govinda+Systems',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
