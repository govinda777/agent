'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy } from '@/modules/auth/client';
import { Loader2 } from 'lucide-react';

export default function SyncPage() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.replace('/login');
      return;
    }

    const syncAccount = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao sincronizar conta');
        }

        const redirectTo = searchParams.get('redirect_to') || '/onboarding';
        router.replace(redirectTo);
      } catch (err: any) {
        console.error('Sync error:', err);
        setError('Ocorreu um erro ao preparar sua conta. Por favor, recarregue a página.');
      }
    };

    syncAccount();
  }, [ready, authenticated, getAccessToken, router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md text-center border border-red-200 shadow-sm">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900">Preparando seu ambiente...</h1>
          <p className="text-gray-500 mt-2">Estamos configurando seus agentes e seu banco de dados.</p>
        </div>
      )}
    </div>
  );
}
