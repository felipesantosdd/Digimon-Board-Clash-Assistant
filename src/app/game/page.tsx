"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useGameState } from "@/hooks/useGameState";
import { capitalize, getLevelName } from "@/lib/utils";
import DigimonDetailsModal from "@/app/components/DigimonDetailsModal";
import DamageDialog from "@/app/components/DamageDialog";
import ReviveDialog from "@/app/components/ReviveDialog";
import { GameDigimon } from "@/types/game";

export default function GamePage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { gameState, saveGameState, clearGameState, isLoading } =
    useGameState();
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [selectedDigimon, setSelectedDigimon] = useState<{
    digimon: GameDigimon;
    playerName: string;
    playerId: number;
    originalId: number; // ID original para rastreamento após evolução
  } | null>(null);
  const [showDamageDialog, setShowDamageDialog] = useState(false);
  const [damageTarget, setDamageTarget] = useState<{
    digimon: GameDigimon;
    name: string;
  } | null>(null);
  const [showReviveDialog, setShowReviveDialog] = useState(false);
  const [reviveTarget, setReviveTarget] = useState<{
    digimon: GameDigimon;
    name: string;
    playerId: number;
  } | null>(null);

  useEffect(() => {
    // Se não há estado de jogo e não está carregando, redirecionar para home
    if (!isLoading && !gameState) {
      enqueueSnackbar("Nenhum jogo ativo encontrado.", { variant: "info" });
      router.push("/");
    }
  }, [gameState, isLoading, router, enqueueSnackbar]);

  const handleEndGame = () => {
    clearGameState();
    enqueueSnackbar("Jogo finalizado!", { variant: "success" });
    router.push("/");
  };

  const handleNextTurn = () => {
    if (!gameState) return;

    const nextPlayerIndex =
      (gameState.currentTurnPlayerIndex + 1) % gameState.players.length;
    const isNewRound = nextPlayerIndex === 0;

    // Resetar hasActedThisTurn do próximo jogador
    const updatedState = {
      ...gameState,
      currentTurnPlayerIndex: nextPlayerIndex,
      turnCount: isNewRound ? gameState.turnCount + 1 : gameState.turnCount,
      players: gameState.players.map((player, idx) => {
        if (idx === nextPlayerIndex) {
          // Resetar ações dos Digimons do próximo jogador
          return {
            ...player,
            digimons: player.digimons.map((d) => ({
              ...d,
              hasActedThisTurn: false,
            })),
          };
        }
        return player;
      }),
    };

    saveGameState(updatedState);
    enqueueSnackbar(
      `Turno de ${capitalize(gameState.players[nextPlayerIndex].name)}!`,
      { variant: "info" }
    );
  };

  const handleDigimonClick = (
    digimon: GameDigimon,
    playerName: string,
    playerId: number
  ) => {
    // Se o Digimon está morto, abrir dialog de reviver
    if (digimon.currentHp <= 0) {
      setReviveTarget({ digimon, name: digimon.name, playerId });
      setShowReviveDialog(true);
    } else {
      setSelectedDigimon({
        digimon,
        playerName,
        playerId,
        originalId: digimon.originalId || digimon.id, // Usar originalId se existir
      });
    }
  };

  const handleDamage = (digimon: GameDigimon) => {
    // Abrir dialog de dano (mantém o modal de detalhes aberto)
    setDamageTarget({ digimon, name: digimon.name });
    setShowDamageDialog(true);
  };

  const applyDamage = (damageAmount: number) => {
    if (!gameState || !damageTarget) return;

    let evolutionUnlocked = false;
    const targetDigimon = damageTarget.digimon;

    // Calcular nova HP
    const newHp = Math.max(0, targetDigimon.currentHp - damageAmount);

    // Calcular % de vida perdida TOTAL (não apenas deste dano)
    const hpLostPercentage =
      ((targetDigimon.dp - newHp) / targetDigimon.dp) * 100;

    // Chance base de 20% + 5% a cada 10% de vida perdida
    const evolutionChance = 20 + Math.floor(hpLostPercentage / 10) * 5;

    // Rolar D100 para verificar evolução (apenas se ainda não pode evoluir)
    if (!targetDigimon.canEvolve && newHp > 0) {
      const roll = Math.floor(Math.random() * 100) + 1;
      if (roll <= evolutionChance) {
        evolutionUnlocked = true;
        enqueueSnackbar(
          `🌟 EVOLUÇÃO LIBERADA! ${capitalize(
            targetDigimon.name
          )} pode evoluir! (Rolou ${roll}/${evolutionChance})`,
          { variant: "success" }
        );
      }
    }

    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => ({
        ...player,
        digimons: player.digimons.map((d) => {
          if (d.id === damageTarget.digimon.id) {
            return {
              ...d,
              currentHp: newHp,
              canEvolve: evolutionUnlocked ? true : d.canEvolve || false,
            };
          }
          return d;
        }),
      })),
    };

    saveGameState(updatedState);
    enqueueSnackbar(
      `${capitalize(
        damageTarget.name
      )} recebeu ${damageAmount.toLocaleString()} de dano!`,
      { variant: "warning" }
    );
    setDamageTarget(null);
  };

  const handleEvolve = async (digimon: GameDigimon) => {
    if (!gameState || !digimon.canEvolve) return;

    try {
      // Buscar evolução do Digimon
      const response = await fetch("/api/digimons/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digimonId: digimon.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        enqueueSnackbar(error.error || "Erro ao evoluir Digimon", {
          variant: "error",
        });
        return;
      }

      const data = await response.json();
      const evolution = data.evolution;

      // Atualizar o Digimon no gameState
      const updatedState = {
        ...gameState,
        players: gameState.players.map((player) => ({
          ...player,
          digimons: player.digimons.map((d) => {
            if (d.id === digimon.id) {
              return {
                ...d,
                id: evolution.id,
                name: evolution.name,
                image: evolution.image,
                level: evolution.level,
                dp: evolution.dp,
                typeId: evolution.typeId,
                currentHp: evolution.dp, // HP resetado para 100%
                canEvolve: false, // Reset da flag de evolução
                originalId: d.originalId || digimon.id, // Guardar ID original
              };
            }
            return d;
          }),
        })),
      };

      saveGameState(updatedState);

      const evolutionType = data.wasInEvolutionLine
        ? "linha evolutiva"
        : "evolução aleatória";

      enqueueSnackbar(
        `🎉 ${capitalize(digimon.name)} evoluiu para ${capitalize(
          evolution.name
        )}! (${evolutionType})`,
        { variant: "success" }
      );

      // Não fecha o modal - mantém aberto com dados atualizados
      // O modal já atualiza automaticamente pois busca do gameState
    } catch (error) {
      console.error("Erro ao evoluir:", error);
      enqueueSnackbar("Erro ao processar evolução", { variant: "error" });
    }
  };

  const handleRevive = (success: boolean) => {
    if (!gameState || !reviveTarget) return;

    if (success) {
      // Reviver com HP cheio
      const updatedState = {
        ...gameState,
        players: gameState.players.map((player) => ({
          ...player,
          digimons: player.digimons.map((d) => {
            if (d.id === reviveTarget.digimon.id) {
              return { ...d, currentHp: d.dp, canEvolve: false };
            }
            return d;
          }),
        })),
      };

      saveGameState(updatedState);
    }

    setReviveTarget(null);
  };

  const markDigimonAsActed = (digimonId: number, playerId: number) => {
    if (!gameState) return;

    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === digimonId) {
                return { ...d, hasActedThisTurn: true };
              }
              return d;
            }),
          };
        }
        return player;
      }),
    };

    saveGameState(updatedState);
  };

  const handleLoot = (digimon: GameDigimon) => {
    if (!gameState || !selectedDigimon) return;

    // Rolar D20 para determinar o loot
    const roll = Math.floor(Math.random() * 20) + 1;
    const lootAmount = roll * 100; // Cada ponto = 100 de DP adicional

    enqueueSnackbar(
      `${capitalize(
        digimon.name
      )} saqueou e encontrou ${lootAmount} DP! (D20: ${roll})`,
      { variant: "success" }
    );

    // Marcar como já agiu
    markDigimonAsActed(selectedDigimon.originalId, selectedDigimon.playerId);
  };

  const handleRest = (digimon: GameDigimon) => {
    if (!gameState || !selectedDigimon) return;

    // Recuperar 20% do HP máximo (DP)
    const healAmount = Math.floor(digimon.dp * 0.2); // 20% do HP máximo
    const newHp = Math.min(digimon.dp, digimon.currentHp + healAmount);
    const actualHeal = newHp - digimon.currentHp;

    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                return {
                  ...d,
                  currentHp: newHp,
                  hasActedThisTurn: true,
                };
              }
              return d;
            }),
          };
        }
        return player;
      }),
    };

    saveGameState(updatedState);

    const hpPercentage = Math.round((actualHeal / digimon.dp) * 100);
    enqueueSnackbar(
      `${capitalize(
        digimon.name
      )} descansou e recuperou ${actualHeal.toLocaleString()} HP (${hpPercentage}%)!`,
      { variant: "success" }
    );
  };

  const handleAttack = (digimon: GameDigimon) => {
    if (!gameState || !selectedDigimon) return;

    // Abrir seleção de alvo (por enquanto, apenas marcar como agiu e abrir dialog de dano)
    enqueueSnackbar(
      `${capitalize(digimon.name)} está pronto para atacar! Selecione o alvo.`,
      { variant: "info" }
    );

    // Marcar como já agiu
    markDigimonAsActed(selectedDigimon.originalId, selectedDigimon.playerId);

    // Abrir dialog de dano para aplicar ao alvo
    setDamageTarget({ digimon, name: digimon.name });
    setShowDamageDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Carregando jogo...
          </h3>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return null; // Redireciona no useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">
                Digimon Board Clash
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Jogo iniciado em{" "}
                {new Date(gameState.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Contador de Turnos */}
              <div className="bg-gray-700 px-4 py-2 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400">Turno</p>
                <p className="text-xl font-bold text-purple-400">
                  #{gameState.turnCount}
                </p>
              </div>

              {/* Botão Passar Turno */}
              <button
                onClick={handleNextTurn}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>⏭️</span>
                <span>Passar Turno</span>
              </button>

              {/* Botão Finalizar Jogo */}
              <button
                onClick={() => setShowEndGameConfirm(true)}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                🚪 Finalizar Jogo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            🎮 Jogo em Andamento
          </h2>
          <p className="text-gray-300">
            {gameState.players.length} jogador
            {gameState.players.length > 1 ? "es" : ""} participando
          </p>
        </div>

        {/* Lista de Jogadores com seus Digimons */}
        <div className="space-y-6">
          {gameState.players.map((player, playerIndex) => {
            const isCurrentTurn =
              playerIndex === gameState.currentTurnPlayerIndex;

            return (
              <div
                key={player.id}
                className={`bg-gray-800 rounded-lg shadow-lg p-6 border-2 transition-all ${
                  isCurrentTurn
                    ? "border-yellow-500 ring-4 ring-yellow-500/30 shadow-yellow-500/50"
                    : "border-gray-700"
                }`}
              >
                {/* Informações do Jogador */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
                  <div className="text-5xl">{player.avatar}</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 font-semibold mb-1">
                      Jogador {playerIndex + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {capitalize(player.name)}
                      {isCurrentTurn && (
                        <span className="text-yellow-400 text-lg animate-pulse">
                          ⭐
                        </span>
                      )}
                    </h3>
                    {isCurrentTurn && (
                      <p className="text-yellow-400 font-bold text-sm mt-1">
                        🎯 Turno Atual
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Parceiros</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {player.digimons.length}
                    </div>
                  </div>
                </div>

                {/* Digimons do Jogador */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    🎴 Digimons Parceiros
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {player.digimons.map((digimon) => {
                      const isDead = digimon.currentHp <= 0;
                      return (
                        <div
                          key={digimon.id}
                          onClick={() =>
                            handleDigimonClick(digimon, player.name, player.id)
                          }
                          className={`bg-gray-700 rounded-lg overflow-hidden border transition-all group cursor-pointer transform hover:scale-105 ${
                            isDead
                              ? "border-gray-800 hover:border-yellow-500"
                              : "border-gray-600 hover:border-blue-400"
                          }`}
                        >
                          {/* Imagem do Digimon */}
                          <div className="relative h-40 bg-gradient-to-br from-gray-600 to-gray-800 overflow-hidden">
                            {isDead && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                                <div className="text-center">
                                  <div className="text-5xl mb-2">💀</div>
                                  <p className="text-red-400 font-bold text-sm">
                                    MORTO
                                  </p>
                                  <p className="text-yellow-400 text-xs mt-1">
                                    Clique para reviver
                                  </p>
                                </div>
                              </div>
                            )}
                            {digimon.image ? (
                              <img
                                src={digimon.image}
                                alt={digimon.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                style={
                                  isDead
                                    ? {
                                        filter:
                                          "grayscale(100%) brightness(0.7)",
                                      }
                                    : undefined
                                }
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-6xl">
                                ❓
                              </div>
                            )}
                            {/* Badge de Level */}
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                              {getLevelName(digimon.level)}
                            </div>
                            {/* Badge de DP */}
                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                              {digimon.dp.toLocaleString()} DP
                            </div>
                            {/* Badge de Evolução Liberada */}
                            {digimon.canEvolve && !isDead && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
                                ✨ PODE EVOLUIR
                              </div>
                            )}
                            {/* Badge de Já Agiu no Turno */}
                            {digimon.hasActedThisTurn &&
                              !isDead &&
                              playerIndex ===
                                gameState.currentTurnPlayerIndex && (
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-gray-500">
                                  ⏸️ Agiu
                                </div>
                              )}
                          </div>

                          {/* Info do Digimon */}
                          <div className="p-3">
                            <h5 className="font-bold text-white text-center mb-2">
                              {capitalize(digimon.name)}
                            </h5>

                            {/* Barra de Vida (HP) */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-semibold">
                                  HP
                                </span>
                                <span className="text-green-400 font-bold">
                                  {digimon.currentHp.toLocaleString()} /{" "}
                                  {digimon.dp.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden border border-gray-500 shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 ease-out flex items-center justify-center"
                                  style={{
                                    width: `${
                                      (digimon.currentHp / digimon.dp) * 100
                                    }%`,
                                  }}
                                >
                                  {digimon.currentHp / digimon.dp >= 0.25 && (
                                    <span className="text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                      {Math.round(
                                        (digimon.currentHp / digimon.dp) * 100
                                      )}
                                      %
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Confirmação para Finalizar Jogo */}
      {showEndGameConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowEndGameConfirm(false)}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">⚠️ Finalizar Jogo</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-200 mb-2">
                Tem certeza que deseja finalizar o jogo?
              </p>
              <p className="text-gray-400 text-sm">
                Todo o progresso será perdido e você será redirecionado para a
                tela inicial.
              </p>
            </div>
            <div className="bg-gray-900 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-gray-700">
              <button
                onClick={() => setShowEndGameConfirm(false)}
                className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEndGame}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Digimon */}
      <DigimonDetailsModal
        isOpen={selectedDigimon !== null}
        onClose={() => setSelectedDigimon(null)}
        digimon={
          selectedDigimon
            ? // Buscar dados atualizados do gameState usando originalId
              gameState?.players
                .find((p) => p.id === selectedDigimon.playerId)
                ?.digimons.find(
                  (d) =>
                    (d.originalId || d.id) === selectedDigimon.originalId ||
                    d.id === selectedDigimon.digimon.id
                ) || null
            : null
        }
        playerName={selectedDigimon?.playerName || ""}
        onDamage={handleDamage}
        onEvolve={handleEvolve}
        onLoot={handleLoot}
        onRest={handleRest}
        onAttack={handleAttack}
        isCurrentPlayerTurn={
          selectedDigimon !== null &&
          gameState !== null &&
          gameState.players.findIndex(
            (p) => p.id === selectedDigimon.playerId
          ) === gameState.currentTurnPlayerIndex
        }
      />

      {/* Dialog de Dano */}
      <DamageDialog
        isOpen={showDamageDialog}
        onClose={() => {
          setShowDamageDialog(false);
          setDamageTarget(null);
        }}
        onConfirm={applyDamage}
        digimonName={capitalize(damageTarget?.name || "")}
      />

      {/* Dialog de Reviver */}
      <ReviveDialog
        isOpen={showReviveDialog}
        onClose={() => {
          setShowReviveDialog(false);
          setReviveTarget(null);
        }}
        onRevive={handleRevive}
        digimonName={capitalize(reviveTarget?.name || "")}
      />
    </div>
  );
}
