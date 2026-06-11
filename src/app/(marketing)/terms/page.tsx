import Link from 'next/link';
import { ArrowLeft, FileText, Shield, CreditCard } from 'lucide-react';

export default function ContratoDeServico() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" href="/">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar para Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-4">
            Termos de Serviço e Contrato
          </h1>
          <p className="text-lg text-gray-600">
            Leia atentamente os termos que regem o uso da nossa Plataforma de Agentes de IA e os serviços de Consultoria Especializada.
          </p>
          <p className="text-sm text-gray-400 mt-2">Última atualização: Junho de 2026</p>
        </div>

        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          {/* Section 1: Plataforma SaaS */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Plataforma de Agentes de IA (SaaS)</h2>
            </div>
            
            <div className="space-y-4 text-gray-600 prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-800">1.1. Uso do Plano Gratuito (Trial)</h3>
              <p>
                O plano gratuito é fornecido "tal como está", com a finalidade de demonstração e validação do serviço. Está limitado a um período de 7 dias ou a 1.000 execuções/mensagens (o que ocorrer primeiro). Reservamo-nos o direito de suspender ou terminar o acesso gratuito caso seja detetado abuso ou uso indevido dos recursos de processamento (LLM).
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">1.2. Disponibilidade e SLA (Service Level Agreement)</h3>
              <p>
                Esforçamo-nos por manter uma disponibilidade de 99.9% nos planos Profissionais (Pro). Contudo, por dependermos de APIs de terceiros (Large Language Models, WhatsApp, Instagram, n8n), não nos responsabilizamos por interrupções de serviço originadas nestes fornecedores externos.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">1.3. Responsabilidade do Conteúdo</h3>
              <p>
                Os agentes autônomos são sistemas probabilísticos baseados em Inteligência Artificial. O Cliente é o único responsável pela revisão dos fluxos e por eventuais "alucinações" (respostas incorretas) que o Agente possa fornecer aos seus consumidores finais. Recomendamos testes exaustivos antes da publicação em canais oficiais (ex: WhatsApp).
              </p>
            </div>
          </div>

          {/* Section 2: Consultoria */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Serviços de Consultoria e Diagnóstico</h2>
            </div>
            
            <div className="space-y-4 text-gray-600 prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-800">2.1. Escopo do Serviço</h3>
              <p>
                O pagamento da taxa de consultoria garante uma sessão técnica exclusiva de até <strong>1 hora e 30 minutos</strong>. O objetivo desta sessão é mapear o problema do cliente, entender como um agente autônomo pode ajudar, definir as ferramentas necessárias e desenhar o fluxo técnico (integrações, fontes de dados e escolha de LLMs).
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">2.2. Exclusões</h3>
              <p>
                A taxa de consultoria remunera <strong>exclusivamente</strong> o tempo de análise, diagnóstico e arquitetura de solução por parte dos nossos engenheiros. <strong>Não inclui</strong> o desenvolvimento prático, a escrita de código, ou a implementação do Agente de IA nos sistemas do cliente. 
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">2.3. Entregável Final</h3>
              <p>
                Após a sessão, o Cliente receberá um documento com a arquitetura proposta e um Orçamento detalhado para o desenvolvimento do Agente, o qual o Cliente é totalmente livre de aceitar ou recusar.
              </p>
            </div>
          </div>

          {/* Section 3: Pagamentos */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Pagamentos, Remarcações e Reembolsos</h2>
            </div>
            
            <div className="space-y-4 text-gray-600 prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-800">3.1. Assinaturas SaaS</h3>
              <p>
                As assinaturas da plataforma (Planos Pro) são cobradas mensalmente de forma recorrente via Stripe. O cancelamento pode ser feito a qualquer momento no Dashboard do cliente, e a renovação automática será suspensa. Não oferecemos reembolsos pro-rata para meses parcialmente utilizados.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">3.2. Taxa de Consultoria (No-Show e Remarcações)</h3>
              <p>
                A sessão de consultoria pode ser remarcada com até 24 horas de antecedência sem custos adicionais. Em caso de não comparência ("no-show") por parte do Cliente à hora agendada, é tolerado um atraso máximo de 15 minutos. Após esse período, a sessão é dada como concluída e a taxa não será reembolsada, sendo necessário um novo pagamento para um novo agendamento.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Ao utilizar os nossos serviços ou ao agendar uma consultoria, o Cliente concorda com a totalidade das cláusulas descritas neste documento.
        </div>
      </main>
    </div>
  );
}
