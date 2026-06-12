'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Briefcase, Users, Loader2 } from 'lucide-react';
import { env } from '@/config/env';

export default function Consulting() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    // Here you could also save the form data (Name, Company, Message) to your DB before redirecting

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: env.stripeConsultingPriceId,
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao iniciar o checkout de consultoria');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: unknown) {
      console.error(err);
      setError('Ocorreu um erro ao processar a solicitação. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white border-b border-gray-200">
        <Link
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          href="/"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar para Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Consultoria e Diagnóstico de IA
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Sessão exclusiva de 1h30 para entender o seu negócio, mapear processos e desenhar a
            arquitetura do seu Agente de IA.
          </p>
        </div>

        {/* Contract / Scope Section */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-16 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            O que inclui a Sessão de Consultoria?
          </h2>
          <p className="text-blue-800 mb-6">
            O valor cobrado refere-se exclusivamente ao tempo e expertise dos nossos engenheiros
            para desenhar a sua solução. A consultoria não inclui o desenvolvimento do agente final.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">1. Entendimento (1h30)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Reunião para mapear o problema e entender como um agente autônomo de IA pode ajudar,
                definindo quais ferramentas e fluxos ele deverá seguir.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">2. Mapeamento Técnico</h3>
              <p className="text-sm text-gray-600 mt-2">
                Identificação das integrações necessárias, análise das fontes de dados existentes e
                seleção dos LLMs (modelos de linguagem) ideais para o seu caso.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">3. Proposta de Orçamento</h3>
              <p className="text-sm text-gray-600 mt-2">
                Entrega de um documento detalhado com o escopo do projeto, prazos e o orçamento
                final para a criação do agente customizado.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg overflow-hidden max-w-2xl mx-auto border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 pb-6 border-b border-gray-200 text-center">
              <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">
                Agendar Sessão de Diagnóstico
              </h3>
              <p className="text-sm text-gray-500">
                Ao solicitar, você concorda com os nossos{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Termos de Serviço e Contrato de Consultoria
                </Link>
                . Será redirecionado para o pagamento da taxa de reserva e análise (R$ 497).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      name="first-name"
                      id="first-name"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                    Sobrenome
                  </label>
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      name="last-name"
                      id="last-name"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Empresa
                </label>
                <div className="mt-1">
                  <input
                    required
                    type="text"
                    name="company"
                    id="company"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Corporativo
                </label>
                <div className="mt-1">
                  <input
                    required
                    id="email"
                    name="email"
                    type="email"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Descreva seu desafio
                </label>
                <div className="mt-1">
                  <textarea
                    required
                    id="message"
                    name="message"
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"
                  ></textarea>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  {isSubmitting
                    ? 'A redirecionar para o pagamento...'
                    : 'Solicitar Consultoria e Pagar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
