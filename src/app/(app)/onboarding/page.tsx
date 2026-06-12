'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { 
  Bot, 
  Zap, 
  Plus, 
  X, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare,
  ChevronRight,
  Settings
} from 'lucide-react';
import { usePrivy } from '@/modules/auth/client';
import { env } from '@/config/env';

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
  const { getAccessToken } = usePrivy();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drawer States
  const [activeChatAgent, setActiveChatAgent] = useState<Agent | null>(null);
  const [activeLogsAgent, setActiveLogsAgent] = useState<Agent | null>(null);

  // Success message states
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (success === 'agent_created') {
      setSuccessMessage('Agente criado com sucesso!');
    } else if (success === 'agent_updated') {
      setSuccessMessage('Agente atualizado com sucesso!');
    }
    
    if (success) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        window.history.replaceState({}, '', window.location.pathname);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        let token = null;
        try { if (env.privyAppIdPublic) token = await getAccessToken(); } catch (e) {}
        const response = await fetch('/api/agents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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
  }, [getAccessToken]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

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
                  {/* Falar / Chat Button */}
                  <button 
                    onClick={() => setActiveChatAgent(agent)}
                    className="inline-flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-md transition-colors shadow-sm"
                    data-testid={`agent-chat-button-${agent.id}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Falar
                  </button>

                  {/* Ver Logs Button */}
                  <button 
                    onClick={() => setActiveLogsAgent(agent)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-all"
                  >
                    Ver Logs
                  </button>

                  {/* Editar Link */}
                  <Link 
                    href={`/agents/${agent.id}/edit`}
                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Slide-out Drawers */}
      {activeChatAgent && (
        <ChatDrawer agent={activeChatAgent} onClose={() => setActiveChatAgent(null)} />
      )}
      {activeLogsAgent && (
        <LogsDrawer agent={activeLogsAgent} onClose={() => setActiveLogsAgent(null)} />
      )}
    </div>
  );
}

// ==========================================
// CHAT DRAWER COMPONENT (Vercel AI SDK)
// ==========================================
function ChatDrawer({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const { getAccessToken } = usePrivy();
  const [chatInput, setChatInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: `/api/agents/${agent.id}/chat`,
      headers: async () => {
        let token = null;
        try { if (env.privyAppIdPublic) token = await getAccessToken(); } catch (e) {}
        if (token) {
          return { 'Authorization': `Bearer ${token}` } as Record<string, string>;
        }
        return {} as Record<string, string>;
      },
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    sendMessage({ text: chatInput });
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out border-l border-gray-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 leading-tight truncate">{agent.name}</h3>
                <span className="text-[11px] text-green-600 flex items-center gap-1 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span>
                  Conectado à API (Streaming)
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Bot className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-gray-900">Fale com seu Agente</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                  Envie uma mensagem abaixo para testar o comportamento do seu agente conectado ao fluxo n8n.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-600 shadow-sm'
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isUser 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {message.parts
                            .map((part) => (part.type === 'text' ? part.text : ''))
                            .join('')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
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

          {/* Form */}
          <form 
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isLoading}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// LOGS DRAWER COMPONENT
// ==========================================
function LogsDrawer({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate mock execution logs
  const [logs, setLogs] = useState([
    {
      id: 'run_a8f92b',
      timestamp: new Date(Date.now() - 5 * 60000).toLocaleString('pt-PT'),
      channel: 'Web',
      status: 'success',
      responseTime: '1.2s',
      tokensUsed: 420,
    },
    {
      id: 'run_c92e7d',
      timestamp: new Date(Date.now() - 32 * 60000).toLocaleString('pt-PT'),
      channel: 'Web',
      status: 'success',
      responseTime: '1.5s',
      tokensUsed: 380,
    },
    {
      id: 'run_b10f8a',
      timestamp: new Date(Date.now() - 120 * 60000).toLocaleString('pt-PT'),
      channel: 'Web',
      status: 'error',
      responseTime: '0.8s',
      tokensUsed: 0,
      errorMessage: 'n8n Webhook Timeout (504)',
    },
    {
      id: 'run_d58e3c',
      timestamp: new Date(Date.now() - 240 * 60000).toLocaleString('pt-PT'),
      channel: 'Web',
      status: 'success',
      responseTime: '1.4s',
      tokensUsed: 512,
    }
  ]);

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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out border-l border-gray-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-inner shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 leading-tight">Histórico de Execuções</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                  Logs do agente: {agent.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 transition-colors disabled:opacity-50"
                title="Atualizar Logs"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total de Chamadas</span>
                <h4 className="text-2xl font-bold text-gray-900 mt-0.5">{logs.length}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Taxa de Sucesso</span>
                <h4 className="text-2xl font-bold text-green-600 mt-0.5">
                  {Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100)}%
                </h4>
              </div>
            </div>

            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Logs de Execução Recentes</h4>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {log.id}
                      </span>
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">
                        {log.channel}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold ${
                      log.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {log.status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sucesso
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Falha
                        </>
                      )}
                    </span>
                  </div>
                  
                  {log.status === 'error' && log.errorMessage && (
                    <div className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-100 rounded p-2 font-semibold">
                      Erro: {log.errorMessage}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="flex gap-3">
                      <span>Tempo: <strong className="text-gray-700 font-semibold">{log.responseTime}</strong></span>
                      {log.tokensUsed > 0 && (
                        <span>Tokens: <strong className="text-gray-700 font-semibold">{log.tokensUsed}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
