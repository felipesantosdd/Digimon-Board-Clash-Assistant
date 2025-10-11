"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { GameState, GameDigimon } from "@/types/game";
import { getTamerImagePath } from "@/lib/image-utils";
import { generateRandomStats } from "@/lib/utils";

interface Tamer {
  id: number;
  name: string;
  image: string; // Este é o campo correto do banco de dados
}

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameSetupModal({
  isOpen,
  onClose,
}: GameSetupModalProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [tamers, setTamers] = useState<Tamer[]>([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTamers();
    }
  }, [isOpen]);

  const fetchTamers = async () => {
    try {
      const response = await fetch("/api/tamers");
      if (response.ok) {
        const data = await response.json();
        setTamers(data);
      }
    } catch (error) {
      console.error("Erro ao carregar Tamers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerToggle = (tamerId: number) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(tamerId)) {
        return prev.filter((id) => id !== tamerId);
      } else {
        // Limitar ao número de jogadores selecionado
        if (prev.length < numPlayers) {
          return [...prev, tamerId];
        }
        return prev;
      }
    });
  };

  const handleStartGame = async () => {
    if (selectedPlayers.length !== numPlayers) {
      enqueueSnackbar(`Selecione exatamente ${numPlayers} jogadores`, {
        variant: "warning",
      });
      return;
    }

    setIsStarting(true);

    try {
      // Buscar dados completos dos tamers selecionados
      const selectedTamersData = await Promise.all(
        selectedPlayers.map(async (id) => {
          const response = await fetch(`/api/tamers/${id}`);
          if (!response.ok) throw new Error(`Erro ao buscar tamer ${id}`);
          return response.json();
        })
      );

      // Buscar TODOS os Digimons level 1 disponíveis
      const allLevel1Response = await fetch("/api/digimons/level/1");
      if (!allLevel1Response.ok)
        throw new Error("Erro ao buscar Digimons level 1");

      const allLevel1Digimons = (await allLevel1Response.json()) as Omit<
        GameDigimon,
        "currentHp" | "canEvolve" | "originalId"
      >[];

      // FILTRAR apenas Digimons ATIVOS (active !== false)
      const activeDigimons = allLevel1Digimons.filter(
        (d) => (d as { active?: boolean }).active !== false
      );

      console.log(
        `🎮 Digimons Level 1: ${allLevel1Digimons.length} total, ${activeDigimons.length} ativos`
      );

      // Embaralhar Digimons disponíveis
      const shuffled = [...activeDigimons].sort(() => Math.random() - 0.5);

      // Sortear 3 Digimons ÚNICOS para cada jogador com tipos diferentes
      const usedDigimonIds = new Set<number>();
      const playersWithDigimons = selectedTamersData.map((tamer) => {
        const playerDigimons: GameDigimon[] = [];
        const usedTypes = new Set<number>(); // Rastrear tipos já usados por este jogador

        // Pegar 3 Digimons únicos com tipos diferentes
        for (const digimon of shuffled) {
          if (
            !usedDigimonIds.has(digimon.id) &&
            !usedTypes.has(digimon.typeId) &&
            playerDigimons.length < 3
          ) {
            usedDigimonIds.add(digimon.id);
            usedTypes.add(digimon.typeId);

            // Gerar HP e DP aleatórios baseados no nível
            const { hp, dp } = generateRandomStats(digimon.level);

            playerDigimons.push({
              ...digimon,
              dp, // DP aleatório
              currentHp: hp, // HP aleatório
              canEvolve: false,
              originalId: digimon.id,
              bag: [], // Inicializar inventário vazio
              evolutionProgress: 0, // Iniciar XP em 0
              provokedBy: null,
              lastProvokeTurn: null,
            });
          }
        }

        // Se não conseguimos 3 Digimons com tipos diferentes, tentar com repetição de tipo
        if (playerDigimons.length < 3) {
          // Limpar tipos usados para permitir repetição
          usedTypes.clear();

          for (const digimon of shuffled) {
            if (!usedDigimonIds.has(digimon.id) && playerDigimons.length < 3) {
              usedDigimonIds.add(digimon.id);
              usedTypes.add(digimon.typeId);

              // Gerar HP e DP aleatórios baseados no nível
              const { hp, dp } = generateRandomStats(digimon.level);

              playerDigimons.push({
                ...digimon,
                dp, // DP aleatório
                currentHp: hp, // HP aleatório
                canEvolve: false,
                originalId: digimon.id,
                bag: [], // Inicializar inventário vazio
                evolutionProgress: 0, // Iniciar XP em 0
                provokedBy: null,
                lastProvokeTurn: null,
              });
            }
          }
        }

        // Verificar se conseguimos 3 Digimons únicos
        if (playerDigimons.length < 3) {
          throw new Error(
            "Não há Digimons suficientes para todos os jogadores"
          );
        }

        return {
          id: tamer.id,
          name: tamer.name,
          avatar: tamer.image,
          digimons: playerDigimons,
        };
      });

      // Sortear ordem dos jogadores (embaralhar)
      const shuffledPlayers = [...playersWithDigimons].sort(
        () => Math.random() - 0.5
      );

      // Criar estado do jogo
      const gameState: GameState = {
        gameId: `game_${Date.now()}`,
        createdAt: new Date().toISOString(),
        players: shuffledPlayers,
        currentTurnPlayerIndex: 0, // Primeiro jogador começa
        turnCount: 1, // Contador de turnos inicia em 1
        sharedBag: [], // Bag compartilhada entre toda a equipe
      };

      // Salvar no localStorage
      localStorage.setItem(
        "digimon_board_clash_game_state",
        JSON.stringify(gameState)
      );

      enqueueSnackbar("Jogo iniciado! Boa sorte!", { variant: "success" });

      // Redirecionar para a página de jogo
      router.push("/game");
      onClose();
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
      enqueueSnackbar("Erro ao iniciar o jogo. Tente novamente.", {
        variant: "error",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleNumPlayersChange = (num: number) => {
    setNumPlayers(num);
    // Limitar jogadores selecionados ao novo número
    if (selectedPlayers.length > num) {
      setSelectedPlayers(selectedPlayers.slice(0, num));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">🎮 Configurar Jogo</h2>
          <p className="text-green-100 text-sm mt-1">
            Selecione o número de jogadores e quem vai jogar
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações sobre Seleção de Digimons */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-lg font-bold text-blue-300 mb-2">
              🎲 Regras de Seleção de Digimons
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                • Cada jogador receberá{" "}
                <span className="text-blue-400 font-semibold">
                  3 Digimons únicos
                </span>
              </p>
              <p>
                • Digimons são{" "}
                <span className="text-purple-400 font-semibold">
                  aleatórios
                </span>{" "}
                e{" "}
                <span className="text-green-400 font-semibold">
                  sem repetições
                </span>
              </p>
              <p>
                • Cada jogador terá Digimons de{" "}
                <span className="text-yellow-400 font-semibold">
                  tipos diferentes
                </span>{" "}
                (Vaccine, Virus, Data, etc.)
              </p>
              <p>
                • Sistema de vantagens:{" "}
                <span className="text-red-400">
                  Vaccine &gt; Virus &gt; Data &gt; Vaccine
                </span>
              </p>
            </div>
          </div>

          {/* Número de Jogadores */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Número de Jogadores
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumPlayersChange(num)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
                    numPlayers === num
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Jogadores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-200">
                Selecione os Jogadores ({selectedPlayers.length}/{numPlayers})
              </label>
              {selectedPlayers.length === numPlayers && (
                <span className="text-xs text-green-400 font-semibold">
                  ✓ Todos selecionados
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-gray-400">Carregando jogadores...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                {tamers.map((tamer) => {
                  const isSelected = selectedPlayers.includes(tamer.id);
                  const canSelect =
                    isSelected || selectedPlayers.length < numPlayers;

                  return (
                    <button
                      key={tamer.id}
                      type="button"
                      onClick={() => canSelect && handlePlayerToggle(tamer.id)}
                      disabled={!canSelect}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        isSelected
                          ? "border-green-500 bg-green-500/20"
                          : canSelect
                          ? "border-gray-600 bg-gray-700 hover:border-gray-500"
                          : "border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-600">
                        <img
                          src={getTamerImagePath(tamer.image)}
                          alt={tamer.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback para emoji se a imagem não existir
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full bg-gray-700"></div>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white text-sm">
                          {tamer.name}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-green-400 font-bold">✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleStartGame}
            disabled={selectedPlayers.length !== numPlayers || isStarting}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
              selectedPlayers.length === numPlayers && !isStarting
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isStarting ? "⏳ Iniciando..." : "🎮 Iniciar Jogo"}
          </button>
        </div>
      </div>
    </div>
  );
}
