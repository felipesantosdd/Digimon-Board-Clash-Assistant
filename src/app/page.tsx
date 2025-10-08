"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import GameSetupModal from "./components/GameSetupModal";

interface Tamer {
  id: number;
  name: string;
  avatar: string;
}

export default function Home() {
  const [tamers, setTamers] = useState<Tamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  useEffect(() => {
    const fetchTamers = async () => {
      try {
        const response = await fetch("/api/tamers");
        if (response.ok) {
          const data = await response.json();
          // Mapear para incluir avatar (usando image como avatar)
          const tamersWithAvatar = data.map(
            (t: { id: number; name: string; image: string }) => ({
              id: t.id,
              name: t.name,
              avatar: t.image,
            })
          );
          setTamers(tamersWithAvatar);
        } else {
          console.error("Erro ao carregar Tamers");
        }
      } catch (error) {
        console.error("Erro ao carregar Tamers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTamers();
  }, []);

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
              <button
                onClick={() => setIsGameModalOpen(true)}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span>▶️</span> Play
              </button>
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
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Selecione seu Tamer
          </h2>
          <p className="text-gray-300">
            Escolha um Tamer para começar sua jornada no mundo digital
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Carregando Tamers...
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {tamers.map((tamer) => (
              <div
                key={tamer.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-blue-400"
              >
                <div className="p-6 flex flex-col items-center">
                  {/* Avatar do Tamer */}
                  <div className="text-6xl mb-4">{tamer.avatar}</div>

                  {/* Nome do Tamer */}
                  <h3 className="text-xl font-bold text-white text-center">
                    {tamer.name}
                  </h3>

                  {/* Botão Selecionar */}
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Selecionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão para adicionar novo Tamer */}
        <div className="mt-8 text-center">
          <Link href="/tamers">
            <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg">
              ➕ Criar Novo Tamer
            </button>
          </Link>
        </div>
      </main>

      {/* Modal de Configuração do Jogo */}
      <GameSetupModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
      />
    </div>
  );
}
