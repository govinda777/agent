import Link from 'next/link';
import { Bot, Zap, Globe, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { env } from '@/config/env';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center justify-center font-bold text-xl text-blue-600" href="/">
          Govinda Systems
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors text-gray-700" href="/consulting">
            Consultoria
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors text-gray-700" href="/login">
            Login
          </Link>
          <Link
            className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            href="/login"
          >
            Começar
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 px-4 md:px-6 flex flex-col items-center text-center bg-gradient-to-b from-white to-blue-50/50">
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              Plataforma Ativa
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Crie o seu agente de IA <br className="hidden sm:block" />em <span className="text-blue-600">minutos</span>.
            </h1>
            
            <p className="mx-auto max-w-[800px] text-lg sm:text-xl text-gray-600 leading-relaxed">
              Conecte aos seus canais favoritos e automatize o atendimento com a inteligência do futuro. Sem complicações.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-medium text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-105"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/consulting"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 text-base font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Falar com Especialista
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-white px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Como Funciona?</h2>
              <p className="mt-4 text-lg text-gray-600">A forma mais rápida de colocar a IA a trabalhar para si.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <Bot size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Crie o Agente</h3>
                <p className="text-gray-600">Dê um nome e conecte a inteligência através do seu fluxo.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Conecte Canais</h3>
                <p className="text-gray-600">Escolha onde o agente vai atuar: WhatsApp, Web, Instagram.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Veja a Mágica</h3>
                <p className="text-gray-600">O seu agente começará a responder e atender clientes 24/7.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers Section */}
        <section className="w-full py-24 px-4 md:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Planos e Preços</h2>
              <p className="mt-4 text-lg text-gray-600">Preços simples para negócios de todos os tamanhos.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Starter Tier */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                  <p className="text-gray-500 mt-2">Para experimentar e validar a IA.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">Grátis</span>
                  <span className="text-gray-500 font-medium"> / {env.freePlanTrialDays} dias</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-gray-600"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" /> 1 Agente de IA</li>
                  <li className="flex items-center text-gray-600"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" /> 1.000 tokens grátis</li>
                  <li className="flex items-center text-gray-600"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" /> 1.000 execuções</li>
                  <li className="flex items-center text-gray-600"><CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" /> Chatbot Web</li>
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl text-center transition-colors"
                >
                  Começar Grátis
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-blue-600 rounded-3xl p-8 border border-blue-600 shadow-xl flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Mais Popular</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">Profissional</h3>
                  <p className="text-blue-100 mt-2">Para empresas que querem escalar o atendimento.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">R$ 97</span>
                  <span className="text-blue-200 font-medium"> / mês</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-blue-50"><CheckCircle2 className="w-5 h-5 text-blue-300 mr-3 shrink-0" /> Agentes Ilimitados</li>
                  <li className="flex items-center text-blue-50"><CheckCircle2 className="w-5 h-5 text-blue-300 mr-3 shrink-0" /> Integração n8n nativa</li>
                  <li className="flex items-center text-blue-50"><CheckCircle2 className="w-5 h-5 text-blue-300 mr-3 shrink-0" /> Canais: WhatsApp, Instagram</li>
                  <li className="flex items-center text-blue-50"><CheckCircle2 className="w-5 h-5 text-blue-300 mr-3 shrink-0" /> Suporte Prioritário</li>
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-blue-600 font-bold rounded-xl text-center transition-colors shadow-sm"
                >
                  Assinar Plano
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-8 border-t border-gray-200 bg-white">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Govinda Systems. Todos os direitos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-6">
          <Link className="text-sm hover:text-gray-900 text-gray-500 transition-colors" href="#">
            Termos de Serviço
          </Link>
          <Link className="text-sm hover:text-gray-900 text-gray-500 transition-colors" href="#">
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
