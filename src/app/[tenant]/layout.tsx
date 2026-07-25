import { headers } from 'next/headers';
import Link from 'next/link';
import { getTenantQuery } from '@/modules/tenants/queries/GetTenantQuery';
import { Sparkles, ArrowRight } from 'lucide-react';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantId } = await params;
  const headersList = await headers();
  const tenantFromHeader = headersList.get('x-tenant-id');

  // Segurança adicional
  if (tenantFromHeader && tenantId !== tenantFromHeader) {
    console.error(`Tenant mismatch: URL (${tenantId}) vs Header (${tenantFromHeader})`);
  }

  // Use Query layer
  const tenant = await getTenantQuery.execute(tenantId);

  const isTrial = tenant?.status === 'FREE';

  return (
    <div className="flex-1 flex flex-col">
      {isTrial && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-4 shadow-md z-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Você está no <strong>Plano Trial</strong>. Libere agentes ilimitados e integrações premium hoje!</span>
          </div>
          <Link
            href={`/${tenantId}/checkout`}
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1 group shadow-sm"
          >
            Fazer Upgrade Agora
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm relative z-40">
        <div className="flex items-center gap-4">
          <Link href={`/${tenantId}/agents`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-black text-blue-600 tracking-tighter uppercase">
              Agent <span className="text-gray-900">2026</span>
            </span>
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isTrial ? 'bg-orange-400' : 'bg-green-500'}`} />
            Tenant: {tenantId.substring(0, 8)}... ({isTrial ? 'Trial' : 'Pro'})
          </span>
        </div>

        <div className="flex items-center gap-4">
           {isTrial && (
              <Link
                href={`/${tenantId}/checkout`}
                className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm"
              >
                Assinar Plano
              </Link>
           )}
           <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
             U
           </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
