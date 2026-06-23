'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NewAgentPage() {
  const router = useRouter();
  const { tenantId } = useParams(); // optional, may be undefined
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: in a real app you'd POST to /api/agents
    console.log('Creating agent', { name, description, tenantId });
    // After creation, redirect to onboarding or agents list
    if (tenantId) {
      router.push(`/${tenantId}/agents`);
    } else {
      router.push('/agents');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md border border-gray-200">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Criar novo agente</h1>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Criar agente
            </button>
            <Link href={tenantId ? `/${tenantId}/agents` : '/agents'}
              className="text-sm text-gray-600 hover:underline"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
