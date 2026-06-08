import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center justify-center font-bold text-xl text-blue-600" href="/">
          Govinda Systems
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700" href="/consulting">
            Consulting
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700" href="/login">
            Login
          </Link>
          <Link
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            href="/checkout"
          >
            Começar Agora
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Crie Agentes de IA Inteligentes para o seu Negócio
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-gray-600 sm:text-xl">
            Automatize o atendimento, colete leads e escale suas operações com agentes de IA personalizados.
            Aproveite nossa oferta de lançamento!
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8 inline-block">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Oferta Especial</h2>
            <ul className="text-left text-blue-700 space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span> 7 dias gratuitos
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> 1000 tokens grátis
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> 1000 execuções grátis
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
            >
              Criar Conta e Aproveitar Oferta
            </Link>
            <Link
              href="/consulting"
              className="inline-flex h-12 items-center justify-center rounded-md border border-gray-300 bg-white px-8 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
            >
              Falar com Consultor
            </Link>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Govinda Systems. Todos os direitos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Termos de Serviço
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
