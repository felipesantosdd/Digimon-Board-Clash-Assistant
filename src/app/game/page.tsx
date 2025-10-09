"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useGameState } from "@/hooks/useGameState";
import { capitalize, getLevelName, DIGIMON_TYPE_NAMES } from "@/lib/utils";
import { getTamerImagePath } from "@/lib/image-utils";
import DigimonDetailsModal from "@/app/components/DigimonDetailsModal";
import AttackDialog from "@/app/components/AttackDialog";
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
  const [showAttackDialog, setShowAttackDialog] = useState(false);
  const [attackerDigimon, setAttackerDigimon] = useState<{
    digimon: GameDigimon;
    playerName: string;
  } | null>(null);
  const [showReviveDialog, setShowReviveDialog] = useState(false);
  const [reviveTarget, setReviveTarget] = useState<{
    digimon: GameDigimon;
    name: string;
    playerId: number;
  } | null>(null);
  const [winner, setWinner] = useState<{
    playerName: string;
    playerImage: string;
    aliveDigimons: GameDigimon[];
  } | null>(null);

  useEffect(() => {
    // Se não há estado de jogo e não está carregando, redirecionar para home
    if (!isLoading && !gameState) {
      enqueueSnackbar("Nenhum jogo ativo encontrado.", { variant: "info" });
      router.push("/");
    }
  }, [gameState, isLoading, router, enqueueSnackbar]);

  // Verificar condição de vitória (apenas quando modal de ataque estiver fechado)
  useEffect(() => {
    if (!gameState || showAttackDialog) return; // Não verificar se modal estiver aberto

    const playersWithAliveDigimons = gameState.players.filter((player) =>
      player.digimons.some((digimon) => digimon.currentHp > 0)
    );

    // Se apenas um jogador tem Digimons vivos, declarar vencedor
    if (playersWithAliveDigimons.length === 1) {
      const winnerPlayer = playersWithAliveDigimons[0];
      const aliveDigimons = winnerPlayer.digimons.filter(
        (d) => d.currentHp > 0
      );

      setWinner({
        playerName: winnerPlayer.name,
        playerImage: getTamerImagePath(winnerPlayer.avatar),
        aliveDigimons,
      });
    }
  }, [gameState, showAttackDialog]);

  const handleEndGame = () => {
    clearGameState();
    enqueueSnackbar("Jogo finalizado!", { variant: "success" });
    router.push("/");
  };

  const handleNextTurn = () => {
    if (!gameState) return;

    console.log("⏭️ [TURN] Passando turno...");

    // Encontrar próximo jogador com Digimons vivos
    let nextPlayerIndex =
      (gameState.currentTurnPlayerIndex + 1) % gameState.players.length;
    let attempts = 0;
    const maxAttempts = gameState.players.length;

    // Loop para encontrar o próximo jogador com Digimons vivos
    while (attempts < maxAttempts) {
      const nextPlayer = gameState.players[nextPlayerIndex];
      const hasAliveDigimons = nextPlayer.digimons.some((d) => d.currentHp > 0);

      if (hasAliveDigimons) {
        // Encontrou um jogador com Digimons vivos!
        console.log(
          "✅ [TURN] Próximo jogador com Digimons vivos:",
          nextPlayer.name
        );
        break;
      }

      // Jogador derrotado, pular para o próximo
      console.log("⏭️ [TURN] Pulando jogador derrotado:", nextPlayer.name);
      nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
      attempts++;
    }

    const isNewRound = nextPlayerIndex <= gameState.currentTurnPlayerIndex;

    // Resetar hasActedThisTurn e defending do próximo jogador
    const updatedState = {
      ...gameState,
      currentTurnPlayerIndex: nextPlayerIndex,
      turnCount: isNewRound ? gameState.turnCount + 1 : gameState.turnCount,
      players: gameState.players.map((player, idx) => {
        if (idx === nextPlayerIndex) {
          // Resetar ações e defesas dos Digimons do próximo jogador
          return {
            ...player,
            digimons: player.digimons.map((d) => ({
              ...d,
              hasActedThisTurn: false,
              defending: null, // Resetar defesa
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

  const applyDamageToDigimon = (digimon: GameDigimon, damageAmount: number) => {
    if (!gameState)
      return { newHp: digimon.currentHp, evolutionUnlocked: false };

    let evolutionUnlocked = false;

    // Calcular nova HP
    const newHp = Math.max(0, digimon.currentHp - damageAmount);

    // Calcular % de vida perdida TOTAL (não apenas deste dano)
    const hpLostPercentage = ((digimon.dp - newHp) / digimon.dp) * 100;

    // Chance base de 20% + 5% a cada 10% de vida perdida
    const evolutionChance = 20 + Math.floor(hpLostPercentage / 10) * 5;

    // Rolar D100 para verificar evolução (apenas se ainda não pode evoluir)
    if (!digimon.canEvolve && newHp > 0) {
      const roll = Math.floor(Math.random() * 100) + 1;
      if (roll <= evolutionChance) {
        evolutionUnlocked = true;
        enqueueSnackbar(
          `🌟 EVOLUÇÃO LIBERADA! ${capitalize(
            digimon.name
          )} pode evoluir! (Rolou ${roll}/${evolutionChance})`,
          { variant: "success" }
        );
      }
    }

    return { newHp, evolutionUnlocked };
  };

  const handleAttackConfirm = (
    targetDigimon: GameDigimon,
    attackerDamage: number,
    defenderDamage: number
  ) => {
    console.log("⚔️ [ATTACK] Iniciando confirmação de ataque...");
    console.log("⚔️ [ATTACK] Atacante:", attackerDigimon?.digimon.name);
    console.log("⚔️ [ATTACK] Alvo original:", targetDigimon.name);
    console.log("⚔️ [ATTACK] Danos:", { attackerDamage, defenderDamage });

    if (!gameState || !attackerDigimon) {
      console.log("❌ [ATTACK] Validação falhou:", {
        gameState: !!gameState,
        attackerDigimon: !!attackerDigimon,
      });
      return;
    }

    console.log("✅ [ATTACK] Validação passou! Processando ataque...");
    console.log("🎯 [ATTACK] Alvo:", targetDigimon.name);

    // Aplicar dano ao alvo (já foi redirecionado no AttackDialog se necessário)
    const defenderResult = applyDamageToDigimon(targetDigimon, attackerDamage);
    console.log("🛡️ [ATTACK] Resultado alvo:", defenderResult);

    // Aplicar dano ao atacante (contra-ataque)
    const attackerResult = applyDamageToDigimon(
      attackerDigimon.digimon,
      defenderDamage
    );
    console.log("⚔️ [ATTACK] Resultado atacante:", attackerResult);

    // Atualizar o gameState com os danos aplicados E marcar como agiu
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => ({
        ...player,
        digimons: player.digimons.map((d) => {
          // Atualizar alvo
          if (d.id === targetDigimon.id) {
            console.log("🎯 [ATTACK] Atualizando alvo:", d.name);
            return {
              ...d,
              currentHp: defenderResult.newHp,
              canEvolve: defenderResult.evolutionUnlocked
                ? true
                : d.canEvolve || false,
              defending: null, // Remove defesa ao ser atacado (interceptou)
            };
          }
          // Atualizar atacante E marcar como já agiu
          if (d.id === attackerDigimon.digimon.id) {
            console.log(
              "🎯 [ATTACK] Atualizando atacante e marcando como agiu:",
              d.name
            );
            return {
              ...d,
              currentHp: attackerResult.newHp,
              canEvolve: attackerResult.evolutionUnlocked
                ? true
                : d.canEvolve || false,
              hasActedThisTurn: true, // Marcar como agiu aqui!
            };
          }
          return d;
        }),
      })),
    };

    console.log("💾 [ATTACK] Chamando saveGameState...");
    saveGameState(updatedState);

    // Mensagens de feedback
    enqueueSnackbar(
      `⚔️ ${capitalize(
        attackerDigimon.digimon.name
      )} causou ${attackerDamage.toLocaleString()} de dano em ${capitalize(
        targetDigimon.name
      )}!`,
      { variant: "warning" }
    );

    enqueueSnackbar(
      `🛡️ ${capitalize(
        targetDigimon.name
      )} contra-atacou causando ${defenderDamage.toLocaleString()} de dano!`,
      { variant: "info" }
    );

    // Não fechar o modal automaticamente - deixar usuário ver os resultados
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

      // Encontrar o jogador dono do Digimon
      const ownerPlayer = gameState.players.find((p) =>
        p.digimons.some((d) => d.id === digimon.id)
      );

      // Adicionar pontuação ao Tamer (se não for nível 3)
      if (ownerPlayer && evolution.level !== 3) {
        updateTamerScore(ownerPlayer.id, evolution.dp);
      }

      // Atualizar o Digimon no gameState e resetar defesas que apontam para ele
      const updatedState = {
        ...gameState,
        players: gameState.players.map((player) => ({
          ...player,
          digimons: player.digimons.map((d) => {
            if (d.id === digimon.id) {
              // Evoluir o Digimon
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
            // Resetar defesa se estava defendendo o Digimon que evoluiu
            if (d.defending === digimon.id) {
              return {
                ...d,
                defending: null,
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

      const scoreMessage =
        evolution.level !== 3 ? ` +${evolution.dp.toLocaleString()} pts!` : "";

      enqueueSnackbar(
        `🎉 ${capitalize(digimon.name)} evoluiu para ${capitalize(
          evolution.name
        )}! (${evolutionType})${scoreMessage}`,
        { variant: "success" }
      );

      // Não fecha o modal - mantém aberto com dados atualizados
      // O modal já atualiza automaticamente pois busca do gameState
    } catch (error) {
      console.error("Erro ao evoluir:", error);
      enqueueSnackbar("Erro ao processar evolução", { variant: "error" });
    }
  };

  const updateTamerScore = (tamerId: number, points: number) => {
    try {
      const stored = localStorage.getItem("digimon_tamer_scores");
      const scores = stored ? JSON.parse(stored) : {};

      scores[tamerId] = (scores[tamerId] || 0) + points;

      localStorage.setItem("digimon_tamer_scores", JSON.stringify(scores));
      console.log(
        `⭐ Pontuação atualizada - Tamer ${tamerId}: +${points} pts (Total: ${scores[tamerId]})`
      );
    } catch (error) {
      console.error("Erro ao atualizar pontuação:", error);
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

  const handleLoot = (digimon: GameDigimon) => {
    console.log("🎒 [LOOT] Iniciando loot...");
    console.log("🎒 [LOOT] Digimon:", digimon.name);

    if (!gameState || !selectedDigimon) {
      console.log("❌ [LOOT] Validação falhou:", {
        gameState: !!gameState,
        selectedDigimon: !!selectedDigimon,
      });
      return;
    }

    // Rolar D20 para determinar o loot
    const roll = Math.floor(Math.random() * 20) + 1;
    const lootAmount = roll * 100; // Cada ponto = 100 de DP adicional
    console.log("🎲 [LOOT] Rolou D20:", roll, "| Loot:", lootAmount);

    // Criar item de loot (GameItem)
    const lootItem = {
      id: Date.now(),
      name: `Loot D20: ${roll}`,
      description: `Boost de ${lootAmount} DP encontrado`,
      image: "/images/items/loot.png",
      effect: `boost_dp_${lootAmount}`,
      quantity: 1,
    };
    console.log("📦 [LOOT] Item criado:", lootItem);

    // Atualizar estado com o loot e marcar como agiu
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                console.log(
                  "🎯 [LOOT] Adicionando loot e marcando como agiu:",
                  d.name
                );
                return {
                  ...d,
                  bag: [...(d.bag || []), lootItem],
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

    console.log("💾 [LOOT] Chamando saveGameState...");
    saveGameState(updatedState);

    enqueueSnackbar(
      `${capitalize(
        digimon.name
      )} saqueou e encontrou ${lootAmount} DP! (D20: ${roll})`,
      { variant: "success" }
    );
  };

  const handleRest = (digimon: GameDigimon) => {
    console.log("💤 [REST] Iniciando descanso...");
    console.log("💤 [REST] Digimon:", digimon.name);

    if (!gameState || !selectedDigimon) {
      console.log("❌ [REST] Validação falhou:", {
        gameState: !!gameState,
        selectedDigimon: !!selectedDigimon,
      });
      return;
    }

    // Recuperar 20% do HP máximo (DP)
    const healAmount = Math.floor(digimon.dp * 0.2); // 20% do HP máximo
    const newHp = Math.min(digimon.dp, digimon.currentHp + healAmount);
    const actualHeal = newHp - digimon.currentHp;
    console.log("💚 [REST] Cura:", { healAmount, newHp, actualHeal });

    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                console.log("🎯 [REST] Curando e marcando como agiu:", d.name);
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

    console.log("💾 [REST] Chamando saveGameState...");
    saveGameState(updatedState);

    const hpPercentage = Math.round((actualHeal / digimon.dp) * 100);
    enqueueSnackbar(
      `${capitalize(
        digimon.name
      )} descansou e recuperou ${actualHeal.toLocaleString()} HP (${hpPercentage}%)!`,
      { variant: "success" }
    );
  };

  const handleUseItem = (digimon: GameDigimon, itemId: number) => {
    console.log("💊 [ITEM] Usando item...");
    console.log("💊 [ITEM] Digimon:", digimon.name, "| Item ID:", itemId);

    if (!gameState || !selectedDigimon) {
      console.log("❌ [ITEM] Validação falhou");
      return;
    }

    const item = digimon.bag?.find((i) => i.id === itemId);
    if (!item) {
      enqueueSnackbar("Item não encontrado!", { variant: "error" });
      return;
    }

    // Aplicar efeito do item
    let newHp = digimon.currentHp;
    let effectMessage = "";

    switch (item.effect) {
      case "heal_1000":
        newHp = Math.min(digimon.dp, digimon.currentHp + 1000);
        effectMessage = `restaurou ${(
          newHp - digimon.currentHp
        ).toLocaleString()} HP`;
        break;
      case "heal_2000":
        newHp = Math.min(digimon.dp, digimon.currentHp + 2000);
        effectMessage = `restaurou ${(
          newHp - digimon.currentHp
        ).toLocaleString()} HP`;
        break;
      case "heal_full":
        newHp = digimon.dp;
        effectMessage = "restaurou HP completamente";
        break;
      default:
        effectMessage = `usou ${item.name}`;
    }

    // Atualizar estado
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                // Remover ou decrementar item
                const updatedBag = (d.bag || [])
                  .map((bagItem) => {
                    if (bagItem.id === itemId) {
                      return bagItem.quantity > 1
                        ? { ...bagItem, quantity: bagItem.quantity - 1 }
                        : null;
                    }
                    return bagItem;
                  })
                  .filter((i) => i !== null);

                return {
                  ...d,
                  currentHp: newHp,
                  bag: updatedBag,
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
    enqueueSnackbar(
      `${capitalize(digimon.name)} ${effectMessage} usando ${item.name}!`,
      { variant: "success" }
    );
  };

  const handleDiscardItem = (digimon: GameDigimon, itemId: number) => {
    console.log("🗑️ [ITEM] Descartando item...");
    console.log("🗑️ [ITEM] Digimon:", digimon.name, "| Item ID:", itemId);

    if (!gameState || !selectedDigimon) {
      console.log("❌ [ITEM] Validação falhou");
      return;
    }

    const item = digimon.bag?.find((i) => i.id === itemId);
    if (!item) {
      enqueueSnackbar("Item não encontrado!", { variant: "error" });
      return;
    }

    // Atualizar estado
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                // Remover item completamente
                const updatedBag = (d.bag || []).filter((i) => i.id !== itemId);

                return {
                  ...d,
                  bag: updatedBag,
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
    enqueueSnackbar(`${item.name} foi descartado!`, { variant: "info" });
  };

  const handleGiveItem = (
    fromDigimon: GameDigimon,
    toDigimonId: number,
    itemId: number
  ) => {
    console.log("🎁 [ITEM] Dando item...");
    console.log(
      "🎁 [ITEM] De:",
      fromDigimon.name,
      "| Para:",
      toDigimonId,
      "| Item ID:",
      itemId
    );

    if (!gameState || !selectedDigimon) {
      console.log("❌ [ITEM] Validação falhou");
      return;
    }

    const item = fromDigimon.bag?.find((i) => i.id === itemId);
    if (!item) {
      enqueueSnackbar("Item não encontrado!", { variant: "error" });
      return;
    }

    // Atualizar estado
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              // Remover do digimon atual
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                const updatedBag = (d.bag || [])
                  .map((bagItem) => {
                    if (bagItem.id === itemId) {
                      return bagItem.quantity > 1
                        ? { ...bagItem, quantity: bagItem.quantity - 1 }
                        : null;
                    }
                    return bagItem;
                  })
                  .filter((i) => i !== null);

                return {
                  ...d,
                  bag: updatedBag,
                  hasActedThisTurn: true,
                };
              }

              // Adicionar ao digimon alvo
              if (d.id === toDigimonId) {
                const existingItem = d.bag?.find((i) => i.id === itemId);
                let updatedBag;

                if (existingItem) {
                  // Incrementar quantidade
                  updatedBag = (d.bag || []).map((i) =>
                    i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
                  );
                } else {
                  // Adicionar novo item
                  updatedBag = [...(d.bag || []), { ...item, quantity: 1 }];
                }

                return {
                  ...d,
                  bag: updatedBag,
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
    const targetDigimon = gameState.players
      .flatMap((p) => p.digimons)
      .find((d) => d.id === toDigimonId);

    enqueueSnackbar(
      `${capitalize(fromDigimon.name)} deu ${item.name} para ${capitalize(
        targetDigimon?.name || "outro digimon"
      )}!`,
      { variant: "success" }
    );
  };

  const handleDefend = (digimon: GameDigimon, targetDigimonId: number) => {
    console.log("🛡️ [DEFEND] Iniciando defesa...");
    console.log(
      "🛡️ [DEFEND] Defensor:",
      digimon.name,
      "| Alvo:",
      targetDigimonId
    );

    if (!gameState || !selectedDigimon) {
      console.log("❌ [DEFEND] Validação falhou");
      return;
    }

    const targetDigimon = gameState.players
      .flatMap((p) => p.digimons)
      .find((d) => d.id === targetDigimonId);

    if (!targetDigimon) {
      enqueueSnackbar("Digimon alvo não encontrado!", { variant: "error" });
      return;
    }

    // Verificar se pode defender (mesmo nível ou inferior)
    if (targetDigimon.level > digimon.level) {
      enqueueSnackbar(
        "Você só pode defender Digimons de nível igual ou inferior!",
        { variant: "warning" }
      );
      return;
    }

    // Atualizar estado
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                // Marcar como defendendo e gastou ação
                return {
                  ...d,
                  defending: targetDigimonId,
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
    enqueueSnackbar(
      `🛡️ ${capitalize(digimon.name)} está defendendo ${capitalize(
        targetDigimon.name
      )}!`,
      { variant: "success" }
    );
  };

  const handleAttack = (digimon: GameDigimon) => {
    if (!gameState || !selectedDigimon) return;

    // NÃO marcar como agiu ainda - só após confirmar o ataque
    // markDigimonAsActed(selectedDigimon.originalId, selectedDigimon.playerId);

    // Abrir dialog de ataque para selecionar alvo
    setAttackerDigimon({
      digimon,
      playerName: selectedDigimon.playerName,
    });
    setShowAttackDialog(true);
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

  // Tela de Vitória
  if (winner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-2 sm:p-4">
        <div className="max-w-4xl w-full text-center">
          {/* Animação de fogos */}
          <div className="text-4xl sm:text-6xl md:text-8xl mb-4 sm:mb-8 animate-bounce">
            🎉 🏆 🎉
          </div>

          {/* Título de Vitória */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-yellow-400 mb-3 sm:mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
            VITÓRIA!
          </h1>

          {/* Imagem e Nome do Vencedor */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 border-2 sm:border-4 border-yellow-500 shadow-2xl">
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 sm:border-4 border-yellow-400 shadow-lg">
                <img
                  src={winner.playerImage}
                  alt={winner.playerName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl bg-gray-700">👤</div>`;
                    }
                  }}
                />
              </div>
              <div>
                <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-1 sm:mb-2">
                  Vencedor:
                </p>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">
                  {capitalize(winner.playerName)}
                </h2>
              </div>
            </div>
          </div>

          {/* Digimons Sobreviventes */}
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-purple-500 sm:border-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400 mb-3 sm:mb-4">
              ⚔️ Digimons Sobreviventes
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 justify-center">
              {winner.aliveDigimons.map((digimon) => (
                <div
                  key={digimon.id}
                  className="bg-gray-700 rounded-lg p-2 sm:p-3 md:p-4 border border-green-500 sm:border-2 w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0"
                >
                  <div className="relative h-24 sm:h-28 md:h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden mb-2">
                    {digimon.image ? (
                      <img
                        src={digimon.image}
                        alt={digimon.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        ❓
                      </div>
                    )}
                  </div>
                  <p className="text-white font-bold text-center text-xs sm:text-sm md:text-base truncate">
                    {capitalize(digimon.name)}
                  </p>
                  <p className="text-green-400 text-xs sm:text-sm text-center">
                    HP: {digimon.currentHp.toLocaleString()} /{" "}
                    {digimon.dp.toLocaleString()}
                  </p>
                  <p className="text-purple-400 text-xs text-center">
                    {getLevelName(digimon.level)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-blue-500 sm:border-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-400 mb-3 sm:mb-4">
              📊 Estatísticas da Partida
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Total de Turnos
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {gameState.turnCount}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Digimons Sobreviventes
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">
                  {winner.aliveDigimons.length}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Jogadores</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400">
                  {gameState.players.length}
                </p>
              </div>
            </div>
          </div>

          {/* Botão para voltar */}
          <button
            onClick={handleEndGame}
            className="w-full sm:w-auto px-6 sm:px-8 md:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base sm:text-lg md:text-xl font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
          >
            🏠 Voltar para Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                Digimon Board Clash
              </h1>
              <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                Jogo iniciado em{" "}
                {new Date(gameState.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
              {/* Contador de Turnos */}
              <div className="bg-gray-700 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-600 flex-1 sm:flex-initial">
                <p className="text-xs text-gray-400">Turno</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-purple-400">
                  #{gameState.turnCount}
                </p>
              </div>

              {/* Botão Passar Turno */}
              <button
                onClick={handleNextTurn}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-center"
              >
                <span>⏭️</span>
                <span className="hidden sm:inline">Passar Turno</span>
                <span className="sm:hidden">Turno</span>
              </button>

              {/* Botão Finalizar Jogo */}
              <button
                onClick={() => setShowEndGameConfirm(true)}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-red-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-red-700 transition-colors hidden sm:flex items-center gap-2"
              >
                🚪 <span className="hidden md:inline">Finalizar Jogo</span>
                <span className="md:hidden">Sair</span>
              </button>

              {/* Botão Finalizar (mobile - só ícone) */}
              <button
                onClick={() => setShowEndGameConfirm(true)}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors sm:hidden"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            🎮 Jogo em Andamento
          </h2>
          <p className="text-sm sm:text-base text-gray-300">
            {gameState.players.length} jogador
            {gameState.players.length > 1 ? "es" : ""} participando
          </p>
        </div>

        {/* Lista de Jogadores com seus Digimons */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {gameState.players.map((player, playerIndex) => {
            const isCurrentTurn =
              playerIndex === gameState.currentTurnPlayerIndex;

            return (
              <div
                key={player.id}
                className={`bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 border-2 transition-all ${
                  isCurrentTurn
                    ? "border-yellow-500 ring-2 sm:ring-4 ring-yellow-500/30 shadow-yellow-500/50"
                    : "border-gray-700"
                }`}
              >
                {/* Informações do Jogador */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 pb-3 sm:pb-4 border-b border-gray-700">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
                    <img
                      src={getTamerImagePath(player.avatar)}
                      alt={player.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback para emoji se a imagem não existir
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl">👤</div>`;
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 font-semibold mb-1">
                      Jogador {playerIndex + 1}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2 truncate">
                      {capitalize(player.name)}
                      {isCurrentTurn && (
                        <span className="text-yellow-400 text-sm sm:text-base md:text-lg animate-pulse flex-shrink-0">
                          ⭐
                        </span>
                      )}
                    </h3>
                    {isCurrentTurn && (
                      <p className="text-yellow-400 font-bold text-xs sm:text-sm mt-1">
                        🎯 Turno Atual
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400 mb-1">Parceiros</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                      {player.digimons.length}
                    </div>
                  </div>
                </div>

                {/* Digimons do Jogador */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 uppercase tracking-wide">
                    🎴 Digimons Parceiros
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
                              : digimon.canEvolve
                              ? "border-yellow-500 rainbow-shadow-pulse"
                              : "border-gray-600 hover:border-blue-400"
                          }`}
                        >
                          {/* Layout Horizontal: Imagem à esquerda, dados à direita */}
                          <div className="flex h-28 sm:h-32 md:h-40">
                            {/* Imagem do Digimon - Lado Esquerdo */}
                            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-gray-600 to-gray-800 overflow-hidden flex-shrink-0">
                              {isDead && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                                  <div className="text-center">
                                    <div className="text-3xl mb-1">💀</div>
                                    <p className="text-red-400 font-bold text-xs">
                                      MORTO
                                    </p>
                                  </div>
                                </div>
                              )}
                              {digimon.image ? (
                                <img
                                  src={digimon.image}
                                  alt={digimon.name}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
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
                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                  ❓
                                </div>
                              )}
                              {/* Badge de Level */}
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1 py-0.5 rounded">
                                {getLevelName(digimon.level)}
                              </div>
                              {/* Badge de Evolução Liberada */}
                              {digimon.canEvolve && !isDead && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                                  ✨
                                </div>
                              )}
                              {/* Badge de Já Agiu no Turno */}
                              {digimon.hasActedThisTurn &&
                                !isDead &&
                                playerIndex ===
                                  gameState.currentTurnPlayerIndex && (
                                  <div className="absolute top-1 right-1 bg-gray-700 text-white text-xs font-bold px-1 py-0.5 rounded shadow-lg border border-gray-500">
                                    ⏸️
                                  </div>
                                )}
                              {/* Badge de Defesa - Mostra no defendido quem o está defendendo */}
                              {(() => {
                                const defender = player.digimons.find(
                                  (d) =>
                                    d.defending === digimon.id &&
                                    d.currentHp > 0
                                );
                                return (
                                  defender &&
                                  !isDead && (
                                    <div className="absolute bottom-1 right-1 bg-cyan-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-cyan-400 flex items-center gap-1">
                                      <span>🛡️</span>
                                      <span>{capitalize(defender.name)}</span>
                                    </div>
                                  )
                                );
                              })()}
                            </div>

                            {/* Dados do Digimon - Lado Direito */}
                            <div className="flex-1 p-2 sm:p-2.5 md:p-3 flex flex-col justify-between min-w-0">
                              {/* Nome, Tipo e DP */}
                              <div>
                                <h5 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">
                                  {capitalize(digimon.name)}
                                </h5>
                                <div className="flex gap-1 sm:gap-1.5 md:gap-2 items-center mb-0.5 sm:mb-1 flex-wrap">
                                  <div className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                    {
                                      DIGIMON_TYPE_NAMES[
                                        digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
                                      ]
                                    }
                                  </div>
                                  <div className="bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                    {digimon.dp.toLocaleString()} DP
                                  </div>
                                </div>
                              </div>

                              {/* Barra de Vida (HP) */}
                              <div className="space-y-0.5 sm:space-y-1">
                                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                                  <span className="text-gray-400 font-semibold">
                                    HP
                                  </span>
                                  <span className="text-green-400 font-bold">
                                    {Math.max(
                                      0,
                                      digimon.currentHp
                                    ).toLocaleString()}{" "}
                                    / {digimon.dp.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2 sm:h-2.5 md:h-3 overflow-hidden border border-gray-500 shadow-inner">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 ease-out flex items-center justify-center"
                                    style={{
                                      width: `${Math.max(
                                        0,
                                        (digimon.currentHp / digimon.dp) * 100
                                      )}%`,
                                    }}
                                  >
                                    {Math.max(0, digimon.currentHp) /
                                      digimon.dp >=
                                      0.3 && (
                                      <span className="text-[9px] sm:text-[10px] md:text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                        {Math.round(
                                          Math.max(
                                            0,
                                            (digimon.currentHp / digimon.dp) *
                                              100
                                          )
                                        )}
                                        %
                                      </span>
                                    )}
                                  </div>
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
        onEvolve={handleEvolve}
        onLoot={handleLoot}
        onRest={handleRest}
        onAttack={handleAttack}
        onDefend={handleDefend}
        onUseItem={handleUseItem}
        onDiscardItem={handleDiscardItem}
        onGiveItem={handleGiveItem}
        playerDigimons={
          selectedDigimon
            ? gameState?.players.find((p) => p.id === selectedDigimon.playerId)
                ?.digimons || []
            : []
        }
        isCurrentPlayerTurn={
          selectedDigimon !== null &&
          gameState !== null &&
          gameState.players.findIndex(
            (p) => p.id === selectedDigimon.playerId
          ) === gameState.currentTurnPlayerIndex
        }
      />

      {/* Dialog de Ataque */}
      <AttackDialog
        isOpen={showAttackDialog}
        onClose={() => {
          setShowAttackDialog(false);
          setAttackerDigimon(null);
        }}
        onConfirm={handleAttackConfirm}
        onEvolve={handleEvolve}
        attacker={attackerDigimon}
        players={gameState?.players || []}
        currentPlayerId={
          gameState?.players[gameState.currentTurnPlayerIndex]?.id || 0
        }
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
