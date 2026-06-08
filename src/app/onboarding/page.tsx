import Link from 'next/link';
import { Bot, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Onboarding() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo à Govinda Systems!</h1>
          <p className="text-gray-600 mt-3 text-lg">Sua conta foi criada com sucesso. Vamos configurar seu primeiro agente.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <h3 className="flex items-center text-blue-800 font-semibold mb-2">
              <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
              Sua Oferta de Lançamento
            </h3>
            <p className="text-blue-700 text-sm">
              Você ativou os 7 dias gratuitos, mais 1000 tokens e 1000 execuções para testar a plataforma.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Crie um Agente</h3>
              <p className="text-sm text-gray-500 mb-4">
                Configure um agente personalizado para o seu tipo de negócio.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Conecte Canais</h3>
              <p className="text-sm text-gray-500 mb-4">
                Integre seu agente com WhatsApp, Web ou Instagram.
              </p>
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <Link
              href="/agents/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Criar Meu Primeiro Agente
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
