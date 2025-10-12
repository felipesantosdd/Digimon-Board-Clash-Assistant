"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameSetupModal from "./components/GameSetupModal";
import { capitalize, generateRandomStats } from "@/lib/utils";
import { getTamerImagePath } from "@/lib/image-utils";

interface Tamer {
  id: number;
  name: string;
  image: string;
}

export default function Home() {
  const router = useRouter();
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

  const createTestGame = async () => {
    try {
      // Buscar todos os Digimons e itens
      const [digimonsRes, itemsRes] = await Promise.all([
        fetch("/api/digimons"),
        fetch("/api/items"),
      ]);

      if (!digimonsRes.ok || !itemsRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const allDigimons = await digimonsRes.json();
      const allItems = await itemsRes.json();

      // Filtrar apenas Digimons ativos
      const activeDigimons = allDigimons.filter(
        (d: { active?: boolean }) => d.active !== false
      );

      // Escolher 6 digimons aleatórios
      const shuffled = [...activeDigimons].sort(() => Math.random() - 0.5);
      const selectedDigimons = shuffled.slice(0, 6);

      // Escolher 2 tamers aleatórios
      const shuffledTamers = [...tamers].sort(() => Math.random() - 0.5);
      const selectedTamers = shuffledTamers.slice(0, 2);

      // Preparar bag compartilhada com TODOS os itens (quantidade 5 cada)
      const sharedBag = allItems.map((item: (typeof allItems)[0]) => ({
        ...item,
        quantity: 5,
      }));

      // Criar jogadores
      const players = selectedTamers.map((tamer, index) => ({
        id: index + 1,
        name: `Jogador ${index + 1}`,
        avatar: tamer.image,
        digimons: selectedDigimons
          .slice(index * 3, (index + 1) * 3)
          .map((digimon: (typeof selectedDigimons)[0]) => {
            const stats = generateRandomStats(digimon.level);
            return {
              id: digimon.id,
              name: digimon.name,
              image: digimon.image,
              level: digimon.level,
              typeId: digimon.typeId,
              dp: stats.dp,
              baseDp: stats.dp, // DP base
              dpBonus: 0, // Sem bônus inicial
              currentHp: stats.hp,
              evolution: digimon.evolution || [],
              canEvolve: true, // XP cheio = pode evoluir
              evolutionProgress: 100, // Barra de XP cheia
              hasActedThisTurn: false,
              originalId: digimon.id,
              bag: [], // Bag individual vazia (usamos sharedBag)
              defending: null,
              provokedBy: null,
              lastProvokeTurn: null,
              statuses: [], // Sem status inicialmente
            };
          }),
      }));

      // Criar estado do jogo
      const gameState = {
        gameId: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
        players,
        currentTurnPlayerIndex: 0,
        turnCount: 1,
        reviveAttemptThisTurn: false,
        activeBoss: null,
        lastBossDefeatedTurn: undefined,
        bossesDefeated: 0,
        sharedBag, // Bag compartilhada com todos os itens
      };

      // Salvar no localStorage (mesma chave que useGameState usa)
      localStorage.setItem(
        "digimon_board_clash_game_state",
        JSON.stringify(gameState)
      );

      // Redirecionar para o jogo
      router.push("/game");
    } catch (error) {
      console.error("Erro ao criar jogo de teste:", error);
      alert("Erro ao criar jogo de teste");
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
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={createTestGame}
                  className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-1 sm:gap-2"
                  title="Inicia jogo de teste com 6 Digimons aleatórios, XP cheio e todos os itens"
                >
                  <span>🧪</span>{" "}
                  <span className="hidden sm:inline">Teste</span>
                </button>
              )}
              <Link href="/biblioteca">
                <button className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-orange-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  <span className="hidden sm:inline">Biblioteca</span>
                  <span className="sm:hidden">📚</span>
                </button>
              </Link>
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
                            parent.innerHTML = `<div class="w-full h-full bg-gray-700"></div>`;
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
