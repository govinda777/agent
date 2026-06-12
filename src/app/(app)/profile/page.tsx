'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Key, Server } from 'lucide-react';
import { usePrivy } from '@/modules/auth/client';

export default function ProfilePage() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [llmProvider, setLlmProvider] = useState('');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [backUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from');
      if (fromParam) return fromParam;
    }
    return '/onboarding';
  });

  const [backText] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from');
      if (fromParam === '/agents/new') {
        return 'Voltar para Novo Agente';
      }
    }
    return 'Voltar para Painel';
  });

  const fetchProfile = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.llmProvider) setLlmProvider(data.llmProvider);
        setHasApiKey(data.hasApiKey);
      }
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (ready && authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfile();
    } else if (ready && !authenticated) {
      window.location.href = '/login';
    }
  }, [ready, authenticated, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          llmProvider: llmProvider || null,
          llmApiKey: llmApiKey || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar configurações.');
      }

      setMessage({ text: 'Configurações salvas com sucesso!', type: 'success' });
      setLlmApiKey(''); // Limpamos do client state
      setHasApiKey(!!llmApiKey || hasApiKey);
    } catch (err: unknown) {
      setMessage({ text: (err as Error).message || 'Erro desconhecido', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 pb-12">
      <div className="mb-6">
        <Link
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          href={backUrl}
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          {backText}
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil e Configurações</h1>
        <p className="mt-2 text-gray-600">
          Configure as chaves globais que serão utilizadas pelos seus agentes de IA.
        </p>
      </div>

      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
            <div className="bg-blue-50 p-2 rounded-lg mr-4 text-blue-600">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Provedor de Inteligência Artificial
              </h2>
              <p className="text-sm text-gray-500">
                A chave configurada aqui será injetada de forma segura nas execuções do n8n.
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
            >
              {message.text}
            </div>
          )}

          {hasApiKey ? (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center">
              <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-full mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800">
                  Chave de API Salva & Ativa
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Provedor atual:{' '}
                  <strong className="uppercase">{llmProvider || 'Padrão (OpenAI)'}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center">
              <div className="bg-amber-100 text-amber-800 p-1.5 rounded-full mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800">Nenhuma Chave Configurada</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Configure um provedor e insira sua chave de API abaixo para habilitar seus agentes
                  de IA.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700">
                Modelo / Provedor
              </label>
              <select
                id="llmProvider"
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value="">Nenhum (Usar default da plataforma)</option>
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>

            <div>
              <label htmlFor="llmApiKey" className="block text-sm font-medium text-gray-700">
                Chave da API (API Key)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="llmApiKey"
                  id="llmApiKey"
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder={
                    hasApiKey ? '******** (Chave já configurada. Digite para alterar)' : 'sk-...'
                  }
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Sua chave será armazenada utilizando criptografia de nível militar (AES-256-GCM)
                atrelada à sua identidade única. Apenas o sistema de automação conseguirá
                descriptografá-la.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
