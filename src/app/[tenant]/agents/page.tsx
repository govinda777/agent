import { headers } from 'next/headers';
import { getPrismaWithRLS } from '@/lib/prisma';
import { Bot, Plus, ExternalLink, Globe, MessageSquare, Instagram, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function TenantAgentsPage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');

  if (!tenantId) {
    return <div>Unauthorized</div>;
  }

  const db = getPrismaWithRLS(tenantId);
  const agents = await db.agent.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seus Agentes</h1>
          <p className="text-gray-500 mt-1">Gerencie e monitore seus assistentes inteligentes.</p>
        </div>

        <Link
          href="/agents/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit"
        >
          <Plus className="w-5 h-5" />
          Novo Agente
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <div key={agent.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex gap-1.5">
                   {agent.channelWeb && <Globe className="w-4 h-4 text-gray-400" title="Web" />}
                   {agent.channelWhatsapp && <MessageSquare className="w-4 h-4 text-gray-400" title="WhatsApp" />}
                   {agent.channelInstagram && <Instagram className="w-4 h-4 text-gray-400" title="Instagram" />}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{agent.name}</h3>
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Criado em {new Date(agent.createdAt).toLocaleDateString('pt-BR')}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <Link
                  href={`/${tenantId}/onboarding?agentId=${agent.id}`}
                  className="flex-1 inline-flex justify-center items-center gap-2 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </Link>
                <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white/50">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum agente por aqui</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-8">
              Comece agora mesmo a automatizar seu atendimento criando seu primeiro agente inteligente.
            </p>
            <Link
              href="/agents/new"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              Criar Meu Primeiro Agente
            </Link>
          </div>
        )}
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-4">
           <span>Data Isolation: Enabled (RLS)</span>
           <span className="w-1 h-1 bg-gray-200 rounded-full" />
           <span>Edge Proxy: Active</span>
        </div>
        <div>
          Govinda Systems &copy; 2026
        </div>
      </footer>
    </div>
  );
}
