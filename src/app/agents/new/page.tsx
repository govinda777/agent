'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function NewAgent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    n8nWebhookUrl: '',
    n8nAuthToken: '',
    channels: {
      web: false,
      whatsapp: false,
      instagram: false,
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        channels: {
          ...prev.channels,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar o agente');
      }


      // Redirect back to dashboard/home after success
      router.push('/?success=agent_created');
    } catch (err: unknown) {
      setError((err as Error).message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/onboarding" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            <ArrowLeft className="mr-1 w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Novo Agente (Integração n8n)</h3>
            <p className="mt-1 text-sm text-gray-500">Configure as opções para o seu novo agente utilizando o fluxo do n8n.</p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-8">

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Informações Básicas</h4>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Agente</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    placeholder="Ex: Assistente de Vendas"
                    required
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Configuração n8n */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Configuração n8n</h4>
                  <p className="text-sm text-gray-500">Informe os dados do seu fluxo n8n que irá processar as mensagens deste agente.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700">
                        A chave de API da Inteligência Artificial (OpenAI/Gemini) será injetada automaticamente neste agente a partir do seu <strong>Perfil</strong>.
                      </p>
                      <p className="mt-3 text-sm md:mt-0 md:ml-6">
                        <Link href="/profile" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                          Configurar Chave <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="n8nWebhookUrl" className="block text-sm font-medium text-gray-700">Webhook URL do n8n</label>
                  <input
                    type="url"
                    name="n8nWebhookUrl"
                    id="n8nWebhookUrl"
                    value={formData.n8nWebhookUrl}
                    onChange={handleInputChange}
                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    placeholder="https://n8n.suaempresa.com/webhook/..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="n8nAuthToken" className="block text-sm font-medium text-gray-700">Auth Token do n8n</label>
                  <input
                    type="password"
                    name="n8nAuthToken"
                    id="n8nAuthToken"
                    value={formData.n8nAuthToken}
                    onChange={handleInputChange}
                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    placeholder="Token de segurança para autenticar as chamadas"
                  />
                  <p className="mt-1 text-xs text-gray-500">Essas credenciais serão criptografadas e salvas de forma segura.</p>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Channels */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Canais de Saída</h4>
                  <p className="text-sm text-gray-500">Onde este agente irá operar?</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="channel_web"
                        name="web"
                        type="checkbox"
                        checked={formData.channels.web}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="channel_web" className="font-medium text-gray-700">Web</label>
                      <p className="text-gray-500">Chat integrado no seu site.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="channel_wa"
                        name="whatsapp"
                        type="checkbox"
                        checked={formData.channels.whatsapp}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="channel_wa" className="font-medium text-gray-700">WhatsApp</label>
                      <p className="text-gray-500">Atendimento via número de WhatsApp.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="channel_ig"
                        name="instagram"
                        type="checkbox"
                        checked={formData.channels.instagram}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="channel_ig" className="font-medium text-gray-700">Instagram</label>
                      <p className="text-gray-500">Respostas automáticas via Direct.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 flex justify-end">
                <Link
                  href="/onboarding"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Agente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
