'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { env } from '@/config/env';

// TODO: Os produtos deveriam estar cadastrados no projeto e nao na strip pois caso agente mude de GW teremos que cadastrar novamente
export default function Checkout() {
  const { user } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: env.stripeProPriceId,
          email: user?.email?.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao iniciar o checkout');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: unknown) {
      console.error(err);
      setError('Ocorreu um erro ao processar o seu pagamento. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Finalizar Subscrição</h1>
          <p className="mt-4 text-lg text-gray-600">
            Você está a um passo de automatizar o seu negócio.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8 border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-blue-600 border-b border-blue-700 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl leading-6 font-bold">Plano Profissional</h3>
              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                Cobrado mensalmente após os 7 dias grátis.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">R$ 97</span>
              <span className="text-sm text-blue-100">/mês</span>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 bg-white">
            <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
              O que está incluído
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-center text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Agentes Ilimitados
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Integração n8n nativa
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> WhatsApp & Instagram
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Suporte Prioritário
              </li>
            </ul>
          </div>

          <div className="px-4 py-6 bg-gray-50 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              Pagamento seguro via Stripe. Cancele quando quiser.
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto bg-white py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
              >
                Pular por agora
              </Link>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                {isSubmitting ? 'Redirecionando...' : 'Assinar Plano Seguro'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
