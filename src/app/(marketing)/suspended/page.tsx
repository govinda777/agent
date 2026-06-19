'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuspendedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const tenant = searchParams.get('tenant');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {reason === 'OVER_BUDGET' ? 'Limite de Uso Atingido' : 'Conta Suspensa'}
        </h1>
        <p className="text-gray-600 mb-6">
          {reason === 'OVER_BUDGET'
            ? `O tenant "${tenant}" atingiu o limite de cota do plano atual. Por favor, realize o upgrade para continuar utilizando o serviço.`
            : `A conta para o tenant "${tenant}" encontra-se temporariamente suspensa por motivos administrativos.`}
        </p>
        <div className="flex flex-col space-y-3">
          <a
            href="/checkout"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Planos e Faturamento
          </a>
          <a
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Voltar para o Início
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuspendedPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuspendedContent />
    </Suspense>
  );
}
