'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function Checkout() {
  const { user } = usePrivy();
  const { tenant } = useParams();
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
    <div className="flex-1 overflow-y-auto bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Finalizar Subscrição</h1>
          <p className="mt-4 text-lg text-gray-600">
            Você está a um passo de destravar o poder total da IA para o seu negócio.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="px-8 py-8 bg-blue-600 text-white flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                <Zap className="w-3 h-3 fill-white" />
                Recomendado
              </div>
              <h3 className="text-3xl font-black leading-none">Plano Profissional</h3>
              <p className="mt-2 text-blue-100 font-medium">Acesso total a todas as funcionalidades premium.</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-4xl font-black tracking-tighter">R$ 97<span className="text-lg opacity-60">/mês</span></div>
              <p className="text-xs text-blue-100 mt-1 uppercase font-bold tracking-widest">Cobrança Mensal</p>
            </div>
          </div>

          <div className="p-8 bg-white">
            <h4 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-[0.2em]">Funcionalidades Destravadas</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {[
                "Agentes Ilimitados",
                "WhatsApp & Instagram",
                "Integração n8n nativa",
                "Suporte Prioritário",
                "Logs em Tempo Real",
                "Treinamento Customizado"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center text-gray-700 gap-3 group">
                  <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="px-8 py-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-gray-500">
               <ShieldCheck className="w-10 h-10 text-gray-300" />
               <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Pagamento Seguro</p>
                  <p className="text-[10px] opacity-60">Processado via Stripe. Cancele quando quiser.</p>
               </div>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <Link 
                href={`/${tenant}/agents`}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition-all text-center"
              >
                Voltar
              </Link>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none inline-flex justify-center items-center py-3 px-8 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : null}
                {isSubmitting ? 'Redirecionando...' : 'Ativar Plano Agora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
