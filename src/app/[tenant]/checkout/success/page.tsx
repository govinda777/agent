'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react';

export default function CheckoutSuccess() {
  const { tenant } = useParams();

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50/50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
           <PartyPopper className="w-4 h-4" />
           Inscrição Ativada
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          Bem-vindo ao Time!
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-10">
          Seu pagamento foi confirmado e seu plano <strong>Profissional</strong> já está ativo para o seu negócio. Todos os recursos premium foram liberados.
        </p>

        <Link
          href={`/${tenant}/agents`}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          Ir para o Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="mt-8 text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">
          Govinda Systems &copy; 2026
        </p>
      </div>
    </div>
  );
}
