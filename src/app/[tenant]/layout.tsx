import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const headersList = await headers();
  const tenantFromHeader = headersList.get('x-tenant-id');

  // Segurança adicional: Garante que o tenant do subdomínio/URL
  // corresponde ao injetado pelo Proxy
  if (tenantFromHeader && tenant !== tenantFromHeader) {
    console.error(`Tenant mismatch: URL (${tenant}) vs Header (${tenantFromHeader})`);
    // Em produção, isso poderia disparar um erro 403 ou redirect
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation bar do Tenant pode vir aqui */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-blue-600 tracking-tighter uppercase">
            Agent <span className="text-gray-900">2026</span>
          </span>
          <div className="h-6 w-px bg-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded border border-gray-100">
            Tenant: {tenant}
          </span>
        </div>
      </nav>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
