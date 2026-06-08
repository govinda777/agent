'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewAgent() {
  const [apiKeyMode, setApiKeyMode] = useState('platform');

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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Novo Agente</h3>
            <p className="mt-1 text-sm text-gray-500">Configure as opções para o seu novo agente de IA.</p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <form className="space-y-8">

              {/* LLM Engine Config */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Configuração do Motor LLM</h4>
                  <p className="text-sm text-gray-500">Como você deseja administrar as chaves de API?</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${apiKeyMode === 'platform' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      name="api_mode"
                      value="platform"
                      className="sr-only"
                      checked={apiKeyMode === 'platform'}
                      onChange={() => setApiKeyMode('platform')}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900">Usar chave da plataforma</span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">Mais simples. Cobrado no seu plano.</span>
                      </span>
                    </span>
                  </label>

                  <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${apiKeyMode === 'custom' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      name="api_mode"
                      value="custom"
                      className="sr-only"
                      checked={apiKeyMode === 'custom'}
                      onChange={() => setApiKeyMode('custom')}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900">Informar minha própria chave</span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">Use sua conta OpenAI/Mistral.</span>
                      </span>
                    </span>
                  </label>
                </div>

                {apiKeyMode === 'custom' && (
                  <div className="mt-3">
                    <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">Chave de API</label>
                    <input
                      type="password"
                      name="api_key"
                      id="api_key"
                      className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      placeholder="sk-..."
                    />
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Agent Type */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Tipo de Agente</h4>
                  <p className="text-sm text-gray-500">Qual será a principal função ou especialidade deste agente?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-blue-500 focus:outline-none">
                    <input type="radio" name="agent_type" value="leads" className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">Atendimento e Coletor de Leads</span>
                      <span className="mt-1 block text-sm text-gray-500">Geral, captação de contatos.</span>
                    </span>
                  </label>

                  <label className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-blue-500 focus:outline-none">
                    <input type="radio" name="agent_type" value="medical" className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">Consultório Médico</span>
                      <span className="mt-1 block text-sm text-gray-500">Agendamentos, dúvidas clínicas simples.</span>
                    </span>
                  </label>

                  <label className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-blue-500 focus:outline-none">
                    <input type="radio" name="agent_type" value="salon" className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">Cabeleireiro</span>
                      <span className="mt-1 block text-sm text-gray-500">Marcação de horários, serviços.</span>
                    </span>
                  </label>

                  <label className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-blue-500 focus:outline-none">
                    <input type="radio" name="agent_type" value="dentist" className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">Dentista</span>
                      <span className="mt-1 block text-sm text-gray-500">Avaliações, agendamentos, retornos.</span>
                    </span>
                  </label>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Channels */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Canais de Comunicação</h4>
                  <p className="text-sm text-gray-500">Onde este agente irá operar?</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="channel_web" name="channels" type="checkbox" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="channel_web" className="font-medium text-gray-700">Web</label>
                      <p className="text-gray-500">Chat integrado no seu site.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="channel_wa" name="channels" type="checkbox" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="channel_wa" className="font-medium text-gray-700">WhatsApp</label>
                      <p className="text-gray-500">Atendimento via número de WhatsApp.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="channel_ig" name="channels" type="checkbox" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="channel_ig" className="font-medium text-gray-700">Instagram</label>
                      <p className="text-gray-500">Respostas automáticas via Direct.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4 mr-2" />
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
