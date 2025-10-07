import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Nome do Sistema */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                Digimon Board Clash
              </h1>
            </Link>

            {/* Botões de Navegação */}
            <div className="flex gap-4">
              <Link href="/tamers">
                <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Tamers
                </button>
              </Link>
              <Link href="/digimons">
                <button className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Digimons
                </button>
              </Link>
              <Link href="/admin">
                <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Admin
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Bem-vindo ao Digimon Board Clash!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Escolha uma opção no menu acima para começar
          </p>
        </div>
      </main>
    </div>
  );
}
