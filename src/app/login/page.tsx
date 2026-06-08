import Link from 'next/link';

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta ao Govinda Systems</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <Link
            href="/onboarding"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
          >
            Entrar
          </Link>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Não tem uma conta? </span>
          <Link href="/checkout" className="text-blue-600 hover:text-blue-500 font-medium">
            Registre-se
          </Link>
        </div>
      </div>
      <div className="mt-8">
         <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Voltar para a página inicial</Link>
      </div>
    </div>
  );
}
