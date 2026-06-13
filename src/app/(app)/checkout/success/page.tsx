'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, Zap } from 'lucide-react';
import { usePrivy } from '@/modules/auth/client';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { ready, authenticated, getAccessToken } = usePrivy();

  useEffect(() => {
    setMounted(true);
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    const verifyCheckout = async () => {
      try {
        const token = await getAccessToken();
        if (sessionId) {
          await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          });
        }
      } catch (error) {
        console.error('Error verifying checkout:', error);
      } finally {
        // Redirect to the dashboard after a short delay
        const timer = setTimeout(() => {
          window.location.href = '/onboarding';
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    if (ready && authenticated) {
      verifyCheckout();
    }
  }, [router, ready, authenticated, getAccessToken]);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50/50">
      <div className="relative">
        {/* Background pulsing glow */}
        <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
        
        {/* Main Icon */}
        <div className="relative bg-white p-6 rounded-full shadow-lg border border-amber-100 flex items-center justify-center animate-[bounce_1s_ease-in-out_infinite]">
          <CheckCircle className="w-20 h-20 text-amber-500" />
        </div>

        {/* Decorative sparkles */}
        <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-amber-400 animate-[spin_3s_linear_infinite]" />
        <Zap className="absolute -bottom-2 -left-4 w-8 h-8 text-amber-400 animate-pulse" />
      </div>

      <div className="mt-12 text-center animate-[fadeIn_1s_ease-out]">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Pagamento Confirmado!
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          Bem-vindo ao <span className="font-bold text-amber-600">Plano Profissional</span>. Seus limites foram removidos e seus agentes já estão prontos para escalar.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Preparando seu painel...</p>
      </div>
    </div>
  );
}
