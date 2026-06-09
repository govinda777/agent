'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, Zap, ArrowRight, CheckCircle2, MessageCircle, MoreVertical, Plus } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  channels: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
  createdAt: string;
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 h-16 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center font-bold text-xl text-blue-600" href="/">
          Govinda Systems
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/checkout"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold rounded-full hover:from-amber-500 hover:to-amber-600 transition-all shadow-sm"
          >
            Upgrade para Pro
          </Link>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
              AD
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Gerencie os seus agentes e integrações.</p>
          </div>
          <Link
            href="/agents/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agente
          </Link>
        </div>

        {/* Subscription Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-start sm:items-center mb-4 sm:mb-0">
            <Zap className="w-5 h-5 text-amber-500 mt-0.5 sm:mt-0 mr-3 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">Plano Gratuito (7 dias restantes)</h3>
              <p className="text-sm text-amber-700">Tem acesso a 1 agente, 1.000 tokens e 1.000 execuções. Para limites ilimitados, faça upgrade.</p>
            </div>
          </div>
          <Link href="/checkout" className="text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-md self-start sm:self-auto transition-colors shadow-sm">
            Fazer Upgrade Agora
          </Link>
        </div>

        {/* Agents Module */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Meus Agentes</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              {agents.length} ativos
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">A carregar agentes...</div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agente criado</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Ainda não tem agentes configurados. Crie o seu primeiro agente para começar a automatizar o seu atendimento.
              </p>
              <Link
                href="/agents/new"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Configurar Primeiro Agente
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {agents.map((agent) => (
                <li key={agent.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4 shrink-0">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{agent.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          Criado a {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          {agent.channels.web && <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Web</span>}
                          {agent.channels.whatsapp && <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">WhatsApp</span>}
                          {agent.channels.instagram && <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Instagram</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Ver Logs
                    </button>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 transition-colors">
                      Editar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
