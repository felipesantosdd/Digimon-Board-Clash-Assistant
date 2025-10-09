"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import GameSetupModal from "./components/GameSetupModal";
import { capitalize } from "@/lib/utils";
import { getTamerImagePath } from "@/lib/image-utils";

interface Tamer {
  id: number;
  name: string;
  image: string;
}

export default function Home() {
  const [tamers, setTamers] = useState<Tamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [tamerScores, setTamerScores] = useState<{ [tamerId: number]: number }>(
    {}
  );

  useEffect(() => {
    const fetchTamers = async () => {
      try {
        const response = await fetch("/api/tamers");
        if (response.ok) {
          const data = await response.json();
          console.log("📊 Tamers carregados da API:", data);
          setTamers(data);
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

  // Carregar pontuações do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("digimon_tamer_scores");
      if (stored) {
        const scores = JSON.parse(stored);
        setTamerScores(scores);
      }
    } catch (error) {
      console.error("Erro ao carregar pontuações:", error);
    }
  }, []);

  const getTamerScore = (tamerId: number): number => {
    return tamerScores[tamerId] || 0;
  };

  const getRankedTamers = () => {
    return [...tamers].sort((a, b) => {
      const scoreA = getTamerScore(a.id);
      const scoreB = getTamerScore(b.id);
      return scoreB - scoreA; // Ordem decrescente
    });
  };

  const getTrophyIcon = (rank: number): string | null => {
    switch (rank) {
      case 0:
        return "🥇"; // Ouro
      case 1:
        return "🥈"; // Prata
      case 2:
        return "🥉"; // Bronze
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo/Nome do Sistema */}
            <Link href="/">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                Digimon Board Clash
              </h1>
            </Link>

            {/* Botões de Navegação */}
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => setIsGameModalOpen(true)}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-1 sm:gap-2"
              >
                <span>▶️</span> <span className="hidden sm:inline">Play</span>
              </button>
              <Link href="/digimons">
                <button className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-orange-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  <span className="hidden sm:inline">Digimons</span>
                  <span className="sm:hidden">📱</span>
                </button>
              </Link>
              {process.env.NODE_ENV === "development" && (
                <Link href="/admin">
                  <button className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md hidden sm:block">
                    Admin
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            🏆 Ranking de Tamers
          </h2>
          <p className="text-sm sm:text-base text-gray-300">
            Evolua seus Digimons para ganhar pontos e conquistar o topo!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
              ⏳
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-300 mb-2">
              Carregando Tamers...
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
            {getRankedTamers().map((tamer, index) => {
              const score = getTamerScore(tamer.id);
              const trophy = getTrophyIcon(index);

              return (
                <div
                  key={tamer.id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-all relative"
                >
                  {/* Troféu (apenas top 3) */}
                  {trophy && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 text-2xl sm:text-3xl md:text-4xl z-10 animate-pulse">
                      {trophy}
                    </div>
                  )}

                  <div className="p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4">
                    {/* Avatar do Tamer */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
                      <img
                        src={getTamerImagePath(tamer.image)}
                        alt={tamer.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl">👤</div>`;
                          }
                        }}
                      />
                    </div>

                    {/* Info do Tamer */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                        <span className="text-gray-400 text-xs sm:text-sm font-semibold">
                          #{index + 1}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 truncate">
                        {capitalize(tamer.name)}
                      </h3>

                      {/* Pontuação */}
                      <div className="bg-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 inline-block">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-yellow-400 text-base sm:text-lg md:text-xl">
                            ⭐
                          </span>
                          <div>
                            <p className="text-[10px] sm:text-xs text-gray-400">
                              Pontuação
                            </p>
                            <p className="text-sm sm:text-base md:text-lg font-bold text-yellow-400">
                              {score.toLocaleString()} pts
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Configuração do Jogo */}
      <GameSetupModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
      />
    </div>
  );
}
