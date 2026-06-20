import { headers } from 'next/headers';

/**
 * DASHBOARD DE AGENTES 2026
 *
 * Esta página reside em app/[tenant]/agents e demonstra o isolamento
 * perfeito utilizando o tenant da URL + Neon RLS.
 */
export default async function TenantAgentsPage() {
  const headersList = await headers();

  // No Next.js 2026, obtemos o tenant ID injetado pelo Proxy
  const tenantId = headersList.get('x-tenant-id');

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Agentes</h1>
        <p className="text-slate-500">Gerencie seus assistentes inteligentes para o tenant <code className="bg-slate-100 px-1 rounded">{tenantId}</code></p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder para Lista de Agentes vindos do db.agent.findMany() */}
        <div className="border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <h3 className="font-semibold">Nenhum agente encontrado</h3>
          <p className="text-sm text-slate-500 mb-4">Comece criando seu primeiro assistente para este tenant.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Criar Novo Agente
          </button>
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t border-slate-100 text-xs text-slate-400">
        Isolamento de Dados: Ativado (Neon RLS) | Camada de Borda: Ativa
      </footer>
    </div>
  );
}
