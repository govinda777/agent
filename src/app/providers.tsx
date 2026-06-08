'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Try using a format that looks like a real ID, e.g., 'cl...', or just use conditional rendering
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    // If we're building and don't have an ID, just render children to avoid build failures
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'apple'],
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
