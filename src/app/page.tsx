"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import GameSetupModal from "./components/GameSetupModal";
import EditTamerModal from "./components/EditTamerModal";
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
  const [isEditTamerModalOpen, setIsEditTamerModalOpen] = useState(false);
  const [selectedTamer, setSelectedTamer] = useState<Tamer | null>(null);
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

  const handleTamerClick = (tamer: Tamer) => {
    // Desabilitar edição em produção
    if (process.env.NODE_ENV === "production") {
      return;
    }

    setSelectedTamer(tamer);
    setIsEditTamerModalOpen(true);
  };

  const handleTamerUpdateSuccess = async () => {
    // Recarregar lista de tamers
    try {
      const response = await fetch("/api/tamers");
      if (response.ok) {
        const data = await response.json();
        setTamers(data);
      }
    } catch (error) {
      console.error("Erro ao recarregar tamers:", error);
    }
  };

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
              <Link href="/digimons">
                <button className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Digimons
                </button>
              </Link>
              {process.env.NODE_ENV === "development" && (
                <Link href="/admin">
                  <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                    Admin
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            🏆 Ranking de Tamers
          </h2>
          <p className="text-gray-300">
            Evolua seus Digimons para ganhar pontos e conquistar o topo!
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {getRankedTamers().map((tamer, index) => {
              const score = getTamerScore(tamer.id);
              const trophy = getTrophyIcon(index);

              return (
                <div
                  key={tamer.id}
                  onClick={() => handleTamerClick(tamer)}
                  className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-all relative ${
                    process.env.NODE_ENV === "development"
                      ? "cursor-pointer"
                      : ""
                  }`}
                >
                  {/* Troféu (apenas top 3) */}
                  {trophy && (
                    <div className="absolute top-3 right-3 text-4xl z-10 animate-pulse">
                      {trophy}
                    </div>
                  )}

                  <div className="p-6 flex items-center gap-4">
                    {/* Avatar do Tamer */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-sm font-semibold">
                          #{index + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {capitalize(tamer.name)}
                      </h3>

                      {/* Pontuação */}
                      <div className="bg-gray-700 rounded-lg px-3 py-2 inline-block">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-xl">⭐</span>
                          <div>
                            <p className="text-xs text-gray-400">Pontuação</p>
                            <p className="text-lg font-bold text-yellow-400">
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

      {/* Modal de Edição de Tamer */}
      <EditTamerModal
        isOpen={isEditTamerModalOpen}
        onClose={() => setIsEditTamerModalOpen(false)}
        tamer={selectedTamer}
        onSuccess={handleTamerUpdateSuccess}
      />
    </div>
  );
}
