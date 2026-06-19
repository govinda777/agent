import { headers } from 'next/headers';

export default async function TenantTestPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const headersList = await headers();
  const tenantFromHeader = headersList.get('x-tenant-id');

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Agent 2026: Tenant Isolation Test
      </h1>

      <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
        <p className="mb-2">
          <strong>Tenant ID (URL Parameter):</strong>
          <span className="ml-2 px-2 py-1 bg-white border rounded text-green-700 font-mono">
            {tenant}
          </span>
        </p>

        <p className="mb-2">
          <strong>Tenant ID (Injected Header):</strong>
          <span className="ml-2 px-2 py-1 bg-white border rounded text-purple-700 font-mono">
            {tenantFromHeader || 'Not provided'}
          </span>
        </p>

        <div className="mt-6 p-4 bg-green-50 text-green-800 rounded border border-green-200">
          ✅ Rewrite successful! You are seeing the content for <strong>{tenant}</strong>
          transparently via the Edge Proxy.
        </div>
      </div>

      <div className="mt-8 text-sm text-slate-500">
        <p>This page is located at <code>src/app/[tenant]/test/page.tsx</code></p>
        <p>The Edge Proxy in <code>src/proxy.ts</code> mapped your subdomain to this dynamic route.</p>
      </div>
    </div>
  );
}
