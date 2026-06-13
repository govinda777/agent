'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Bot, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

type TabType = 'e2e' | 'integration' | 'unit';

export default function EvidencesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('e2e');

  const tabs = [
    {
      id: 'e2e' as TabType,
      title: 'Testes E2E (Playwright)',
      url: '/test-results/e2e/index.html',
      icon: ShieldCheck,
      badge: 'Gherkin BDD',
      description: 'Simulação real da jornada do usuário no navegador (onboarding, login e chat).',
    },
    {
      id: 'integration' as TabType,
      title: 'Testes de Integração',
      url: '/test-results/integration/index.html',
      icon: Bot,
      badge: 'Database & n8n',
      description: 'Chamadas de integração reais com persistência e comunicação com n8n local.',
    },
    {
      id: 'unit' as TabType,
      title: 'Testes Unitários',
      url: '/test-results/unit/index.html',
      icon: Terminal,
      badge: 'Vitest',
      description: 'Cobertura de criptografia, lógica de negócio e validação dos casos de uso.',
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Header */}
      <header className="w-full bg-gray-900/60 backdrop-blur-md border-b border-gray-900 px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-base text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            G
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Govinda Systems — Evidências
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-full">
            <CheckCircle2 className="w-4.5 h-4.5" />
            Testes OK
          </span>
          <Link
            href="/onboarding"
            className="text-xs font-semibold text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 px-3.5 py-1.5 rounded-full transition-all"
          >
            Voltar ao App
          </Link>
        </div>
      </header>

      {/* Main container split into selector and iframe area */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        {/* Sidebar Selector */}
        <aside className="w-full md:w-80 bg-gray-900/20 border-b md:border-b-0 md:border-r border-gray-900 p-6 flex flex-col gap-4 shrink-0 overflow-y-auto z-10">
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Relatórios Disponíveis
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Selecione uma das suítes de testes para inspecionar os relatórios interativos gerados
              em tempo real.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'bg-gray-900/40 border-gray-900 hover:border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                      <span className="font-semibold text-sm">
                        {tab.title.split(' ')[1] || tab.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal line-clamp-2">
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-900 flex flex-col gap-2.5">
            <a
              href={currentTab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition-all shadow-md"
            >
              Abrir em nova aba
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>

        {/* Interactive iframe viewport */}
        <main className="flex-1 bg-gray-950 p-4 md:p-6 flex flex-col overflow-hidden relative">
          {/* Pulsing indicator of active embed */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-500">
                Visualizando:{' '}
                <strong className="text-gray-300 font-medium">{currentTab.title}</strong>
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-mono hidden sm:inline">
              Source: {currentTab.url}
            </span>
          </div>

          {/* Iframe Viewport wrapper */}
          <div className="flex-grow w-full border border-gray-900 rounded-2xl overflow-hidden bg-white shadow-2xl relative">
            <iframe
              src={currentTab.url}
              className="w-full h-full border-0 absolute inset-0"
              title={currentTab.title}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
