'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import {
  Bot,
  Send,
  Plus,
  Settings,
  Clock,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { Agent } from '@/modules/agents/domain/Agent';

/**
 * ONBOARDING / DASHBOARD PRINCIPAL
 *
 * Demonstração do ecossistema de agentes com chat integrado.
 */
export default function OnboardingPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Vercel AI SDK
  const { messages, input: chatInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: selectedAgent ? `/api/agents/${selectedAgent.id}/chat` : undefined,
    initialMessages: [
      { id: '1', role: 'assistant', content: 'Olá! Selecione um agente ao lado para começar a conversar.' }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgent) {
          setSelectedAgent(data[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar agentes:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      void fetchAgents();
    }
  }, [authenticated, fetchAgents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* Sidebar de Agentes */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Meus Agentes
          </h2>
          <button
            onClick={() => router.push('/agents/new')}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoadingAgents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Nenhum agente criado ainda.</p>
            </div>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedAgent?.id === agent.id
                    ? 'bg-blue-50 border-blue-100 border shadow-sm'
                    : 'hover:bg-gray-50 border-transparent border'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                   selectedAgent?.id === agent.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{agent.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">Clique para conversar</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-600"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedAgent ? (
          <>
            <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{selectedAgent.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLogsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Logs
                </button>
                <button
                  onClick={() => router.push(`/agents/${selectedAgent.id}/edit`)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.role === 'user' ? <div className="text-[10px] font-bold">EU</div> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Bot className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo ao Agent Platform</h3>
            <p className="text-gray-500 max-w-sm mb-8 text-sm">
              Conecte o seu negócio à inteligência artificial. Comece criando um agente ou selecione um existente.
            </p>
            <button
              onClick={() => router.push('/agents/new')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Criar Meu Primeiro Agente
            </button>
          </div>
        )}
      </div>

      {selectedAgent && isLogsOpen && (
        <LogsDrawer _agent={selectedAgent} onClose={() => setIsLogsOpen(false)} />
      )}
    </div>
  );
}

function LogsDrawer({ _agent, onClose }: { _agent: Agent; onClose: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<{
    id: string;
    timestamp: string;
    channel: string;
    status: string;
    responseTime: string;
    tokensUsed: number;
    errorMessage?: string;
  }[]>([]);

  useEffect(() => {
    // Gerar logs iniciais de forma estável
    const now = Date.now();
    const mockLogs = [
      {
        id: 'run_a8f92b',
        timestamp: new Date(now - 5 * 60000).toLocaleString('pt-PT'),
        channel: 'Web',
        status: 'success',
        responseTime: '1.2s',
        tokensUsed: 420,
      },
      {
        id: 'run_c92e7d',
        timestamp: new Date(now - 32 * 60000).toLocaleString('pt-PT'),
        channel: 'Web',
        status: 'success',
        responseTime: '1.5s',
        tokensUsed: 380,
      }
    ];
    setLogs(mockLogs);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newLog = {
        id: 'run_' + Math.random().toString(36).substring(2, 8),
        timestamp: new Date().toLocaleString('pt-PT'),
        channel: 'Web',
        status: Math.random() > 0.15 ? 'success' : 'error',
        responseTime: (1.0 + Math.random() * 0.8).toFixed(1) + 's',
        tokensUsed: Math.floor(250 + Math.random() * 300),
        ...(Math.random() > 0.85 ? { errorMessage: 'n8n Workflow Internal Server Error (500)' } : {})
      };
      setLogs(prev => [newLog, ...prev]);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Histórico de Execuções</h3>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
               </button>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">{log.id}</span>
                  <span className={`text-xs font-bold ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.status === 'success' ? 'Sucesso' : 'Falha'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                  <span>{log.timestamp}</span>
                  <span>Tempo: {log.responseTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
