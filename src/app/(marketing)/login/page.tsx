'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@/modules/auth/client';

export default function Login() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/onboarding');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta ao Govinda Systems</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center mb-4">
            Utilize nosso sistema de autenticação seguro para acessar sua conta.
          </p>

          <button
            onClick={login}
            disabled={!ready}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {ready ? 'Entrar / Registrar com Privy' : 'Carregando...'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Problemas para acessar? </span>
          <Link href="/consulting" className="text-blue-600 hover:text-blue-500 font-medium">
            Fale conosco
          </Link>
        </div>
      </div>
      <div className="mt-8">
         <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Voltar para a página inicial</Link>
      </div>
    </div>
  );
}
