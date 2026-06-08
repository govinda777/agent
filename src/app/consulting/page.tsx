import Link from 'next/link';
import { ArrowLeft, MessageSquare, Briefcase, Users } from 'lucide-react';

export default function Consulting() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900" href="/">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar para Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Consultoria Especializada em IA
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Entendemos o seu problema e criamos um agente específico para o seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">1. Entendimento</h3>
            <p className="text-gray-500 text-sm">
              Analisamos as necessidades únicas da sua empresa e como a IA pode resolvê-las.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">2. Desenvolvimento</h3>
            <p className="text-gray-500 text-sm">
              Nossa equipe constrói e treina um agente customizado integrado aos seus sistemas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">3. Implementação</h3>
            <p className="text-gray-500 text-sm">
              Lançamos o agente nos seus canais e oferecemos suporte contínuo para otimização.
            </p>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Fale com um Especialista</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">Nome</label>
                  <div className="mt-1">
                    <input type="text" name="first-name" id="first-name" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                  <div className="mt-1">
                    <input type="text" name="last-name" id="last-name" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
                <div className="mt-1">
                  <input type="text" name="company" id="company" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Corporativo</label>
                <div className="mt-1">
                  <input id="email" name="email" type="email" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Descreva seu desafio</label>
                <div className="mt-1">
                  <textarea id="message" name="message" rows={4} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"></textarea>
                </div>
              </div>

              <div>
                <button type="button" className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Solicitar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
