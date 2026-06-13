'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@/modules/auth/client';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, authenticated, getAccessToken } = usePrivy();
  const [isClient, setIsClient] = useState(false);
  const [tenantStatus, setTenantStatus] = useState<string>('FREE');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && ready && !authenticated) {
      window.location.href = '/login';
    }
  }, [isClient, ready, authenticated]);

  useEffect(() => {
    const fetchTenantStatus = async () => {
      if (isClient && ready && authenticated) {
        try {
          const token = await getAccessToken();
          const response = await fetch('/api/tenant', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 403) {
            const data = await response.json();
            if (data.code === 'NOT_PROVISIONED') {
              window.location.href = '/sync';
              return;
            }
          }

          if (response.ok) {
            const data = await response.json();
            if (data.status) {
              setTenantStatus(data.status);
            }
          }
        } catch (error) {
          console.error('Failed to fetch tenant status in layout:', error);
        }
      }
    };
    fetchTenantStatus();
  }, [isClient, ready, authenticated, getAccessToken]);

  // Show loading on server and initial client render to avoid hydration mismatch
  if (!isClient || !ready || !authenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const userEmail = user?.email?.address || 'User';
  const userInitials = userEmail !== 'User' ? userEmail.slice(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 h-16 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center font-bold text-xl text-blue-600" href="/onboarding">
          Govinda Systems
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {tenantStatus !== 'ACTIVE' && (
            <Link
              href="/checkout"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold rounded-full hover:from-amber-500 hover:to-amber-600 transition-all shadow-sm"
            >
              Upgrade para Pro
            </Link>
          )}
          <Link
            href="/profile"
            className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
              {userInitials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{userEmail}</span>
          </Link>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
}
