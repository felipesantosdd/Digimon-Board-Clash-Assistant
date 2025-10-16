"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useGameState } from "@/hooks/useGameState";
import {
  capitalize,
  getLevelName,
  DIGIMON_TYPE_NAMES,
  getTypeColor,
  generateRandomStats,
  generateArmorStats,
  calculatePowerWithBonus,
} from "@/lib/utils";
import TypeIcon from "../components/TypeIcons";
import { getTamerImagePath } from "@/lib/image-utils";
// AttackDialog removido: ataque agora é seleção inline
import ReviveDialog from "@/app/components/ReviveDialog";
import EvolutionAnimation from "@/app/components/EvolutionAnimation";
import BossCard from "@/app/components/BossCard";
import BossCountdown from "@/app/components/BossCountdown";
import DefeatScreen from "@/app/components/DefeatScreen";
import BossDropModal from "@/app/components/BossDropModal";
import type { GameDigimon, GameBoss } from "@/types/game";
import type { BattleResult } from "@/lib/battle-manager";
import { BattleManager } from "@/lib/battle-manager";
import type { Item } from "@/types/item";
import { BossManager } from "@/lib/boss-manager";

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
  // Modal de ataque removido
  // Pickers opcionais (defender/provocar)
  const [, setShowDefendPickerId] = useState<number | null>(null);
  const [, setShowProvokePickerId] = useState<number | null>(null);
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
  const [evolvingDigimon, setEvolvingDigimon] = useState<{
    digimon: GameDigimon;
    evolution?: {
      id: number;
      name: string;
      image: string;
      level: number;
      dp: number;
      typeId: number;
    };
    evolutionType?: string;
    allOptions?: Array<{ id: number; name: string; image: string }>;
  } | null>(null);
  const [isAttackingBoss, setIsAttackingBoss] = useState(false);

  // Estado para mostrar dano recente em Digimons
  const [recentDamage, setRecentDamage] = useState<{
    digimonId: number;
    damage: number;
    timestamp: number;
  } | null>(null);

  // Estados para derrota e drops
  const [showDefeatScreen, setShowDefeatScreen] = useState(false);
  const [showBossDropModal, setShowBossDropModal] = useState(false);
  const [bossDropData, setBossDropData] = useState<{
    boss: GameBoss;
    winnerName: string;
    winnerAvatar: string;
    drops: Item[];
  } | null>(null);

  // Limpar indicador de dano após 2 segundos
  useEffect(() => {
    if (recentDamage) {
      const timer = setTimeout(() => {
        setRecentDamage(null);
      }, 2000); // 2 segundos
      return () => clearTimeout(timer);
    }
  }, [recentDamage]);

  useEffect(() => {
    // Se não há estado de jogo e não está carregando, redirecionar para home
    if (!isLoading && !gameState) {
      enqueueSnackbar("Nenhum jogo ativo encontrado.", { variant: "info" });
      router.push("/");
    }
  }, [gameState, isLoading, router, enqueueSnackbar]);

  // Sistema de Boss: Spawn e Turno do Mundo
  useEffect(() => {
    if (!gameState) return;

    const checkBossSpawn = async () => {
      // Verificar se deve spawnar um boss
      const shouldSpawn = BossManager.shouldSpawnBoss(
        gameState.turnCount,
        gameState.lastBossDefeatedTurn,
        gameState.activeBoss
      );

      if (shouldSpawn) {
        const newBoss = await BossManager.spawnBoss(
          gameState.players,
          gameState.turnCount
        );

        if (newBoss) {
          saveGameState({
            ...gameState,
            activeBoss: newBoss,
          });
          enqueueSnackbar(`👹 BOSS APARECEU: ${newBoss.name}!`, {
            variant: "warning",
          });
        }
      }
    };

    checkBossSpawn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.turnCount]); // Executar quando o turno mudar

  // Verificar condição de vitória/derrota (apenas quando modal de ataque estiver fechado)
  useEffect(() => {
    if (!gameState) return;

    const playersWithAliveDigimons = gameState.players.filter((player) =>
      player.digimons.some((digimon) => digimon.currentHp > 0)
    );

    // Verificar se todos os Digimons foram eliminados e há um boss ativo
    if (
      playersWithAliveDigimons.length === 0 &&
      gameState.activeBoss &&
      !gameState.activeBoss.isDefeated
    ) {
      setShowDefeatScreen(true);
      return;
    }

    // Se apenas um jogador tem Digimons vivos, declarar vencedor
    // MAS APENAS SE NÃO HOUVER BOSS ATIVO OU O BOSS JÁ FOI DERROTADO
    if (playersWithAliveDigimons.length === 1) {
      const hasBossAlive =
        gameState.activeBoss && !gameState.activeBoss.isDefeated;

      if (!hasBossAlive) {
        const winnerPlayer = playersWithAliveDigimons[0];
        const aliveDigimons = winnerPlayer.digimons.filter(
          (d) => d.currentHp > 0
        );

        setWinner({
          playerName: winnerPlayer.name,
          playerImage: getTamerImagePath(winnerPlayer.avatar),
          aliveDigimons,
        });
      } else {
      }
    }
  }, [gameState]);

  // Auto-encerrar turno quando não há mais ações disponíveis
  useEffect(() => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const hasAvailableActions = currentPlayer.digimons.some(
      (d) => d.currentHp > 0 && !d.hasActedThisTurn
    );

    if (!hasAvailableActions) {
      // Auto-encerrar turno após 1.5 segundo
      const timer = setTimeout(() => {
        handleNextTurn();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameState?.players, gameState?.currentTurnPlayerIndex]);

  const handleEndGame = () => {
    clearGameState();
    enqueueSnackbar("Jogo finalizado!", { variant: "success" });
    router.push("/");
  };

  // ============= FUNÇÕES DE GESTÃO DE STATUS =============

  /**
   * Adiciona ou renova um status para um Digimon
   */
  const addOrRenewStatus = (
    digimon: GameDigimon,
    statusType: "animado" | "medo",
    currentTurn: number
  ): GameDigimon => {
    const statuses = digimon.statuses || [];
    const existingStatus = statuses.find((s) => s.type === statusType);

    if (existingStatus) {
      // Renovar duração
      return {
        ...digimon,
        statuses: statuses.map((s) =>
          s.type === statusType ? { ...s, endsAtTurn: currentTurn + 3 } : s
        ),
      };
    } else {
      // Adicionar novo status
      return {
        ...digimon,
        statuses: [
          ...statuses,
          { type: statusType, endsAtTurn: currentTurn + 3 },
        ],
      };
    }
  };

  /**
   * Remove status expirados baseado no turno atual
   */
  const removeExpiredStatuses = (
    digimon: GameDigimon,
    currentTurn: number
  ): GameDigimon => {
    if (!digimon.statuses || digimon.statuses.length === 0) return digimon;

    const activeStatuses = digimon.statuses.filter(
      (s) => s.endsAtTurn > currentTurn
    );

    return {
      ...digimon,
      statuses: activeStatuses,
    };
  };

  /**
   * Reverte evolução temporária se expirou (Spirits/Armor)
   */
  const revertTemporaryEvolution = (
    digimon: GameDigimon,
    currentTurn: number
  ): GameDigimon => {
    // Verificar se tem evolução temporária e se expirou
    if (!digimon.temporaryEvolution) return digimon;

    if (currentTurn >= digimon.temporaryEvolution.expiresAtTurn) {
      const previousFormName = digimon.temporaryEvolution.previousForm.name;

      enqueueSnackbar(
        `⏰ ${capitalize(digimon.name)} voltou para ${capitalize(
          previousFormName
        )}! (Evolução temporária expirou)`,
        { variant: "info" }
      );

      // Reverter para a forma anterior
      const previousForm = digimon.temporaryEvolution.previousForm;

      // Calcular HP proporcional ao reverter
      const currentHpPercentage =
        digimon.dp > 0 ? digimon.currentHp / digimon.dp : 0;
      const revertedHp = Math.min(
        previousForm.dp,
        Math.floor(previousForm.dp * currentHpPercentage)
      );

      return {
        ...digimon,
        id: previousForm.id,
        name: previousForm.name,
        image: previousForm.image,
        level: previousForm.level,
        dp: previousForm.dp,
        baseDp: previousForm.dp,
        currentHp: Math.max(1, revertedHp), // Mínimo 1 HP
        typeId: previousForm.typeId,
        evolutionProgress: previousForm.evolutionProgress,
        temporaryEvolution: undefined, // Remover dados de evolução temporária
        evolutionLocked: false, // Desbloquear evoluções normais
        canEvolve: false, // Resetar flag
      };
    }

    return digimon;
  };

  /**
   * Calcula o modificador de dano baseado nos status ativos
   */
  const getStatusDamageModifier = (digimon: GameDigimon): number => {
    if (!digimon.statuses || digimon.statuses.length === 0) return 0;

    let modifier = 0;
    for (const status of digimon.statuses) {
      if (status.type === "animado") {
        modifier += 20; // +20 de dano
      } else if (status.type === "medo") {
        modifier -= 20; // -20 de dano
      }
    }

    return modifier;
  };

  // ============= FIM DAS FUNÇÕES DE STATUS =============

  const handleNextTurn = () => {
    if (!gameState) return;

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
        break;
      }

      // Jogador morto (todos os digimons nocauteados), pular para o próximo
      nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
      attempts++;
    }

    // Verificar se é o ÚLTIMO jogador passando o turno (fim da rodada)
    const isLastPlayer = nextPlayerIndex === 0;
    const isNewRound = isLastPlayer;

    // Se é o último jogador passando turno E há um boss ativo, executar Turno do Mundo ANTES
    let updatedPlayers = gameState.players;
    let updatedBoss = gameState.activeBoss;

    if (
      isLastPlayer &&
      gameState.activeBoss &&
      !gameState.activeBoss.isDefeated
    ) {
      // Atualizar aggro do boss antes do ataque
      updatedBoss = { ...gameState.activeBoss };
      if (updatedBoss.lastAttackers && updatedBoss.lastAttackers.length > 0) {
        // Encontrar Digimon que causou mais dano
        const topAttacker = updatedBoss.lastAttackers.reduce((max, current) =>
          current.damage > max.damage ? current : max
        );
        updatedBoss.topAggroDigimonId = topAttacker.digimonId;

        // Buscar nome do Digimon para log
        let topDigimonName = "Desconhecido";
        gameState.players.forEach((player) => {
          const digimon = player.digimons.find(
            (d) => d.id === topAttacker.digimonId
          );
          if (digimon) topDigimonName = digimon.name;
        });
      } else {
        updatedBoss.topAggroDigimonId = null;
      }

      const result = BossManager.executeWorldTurn(updatedBoss, updatedPlayers);

      // ATUALIZAR os players com os Digimons feridos
      updatedPlayers = result.updatedPlayers;

      // Resetar contadores de dano para a próxima rodada
      updatedBoss.lastAttackers = [];

      enqueueSnackbar(
        `🌍 TURNO DO MUNDO! ${gameState.activeBoss.name} atacou ${
          result.targetDigimonName
        } e causou ${result.damageDealt.toLocaleString()} de dano! (⚔️ Poder: ${
          result.bossPower
        } | 🛡️ Defesa: ${result.targetDefense})`,
        { variant: "error" }
      );
    }

    // Resetar hasActedThisTurn, defending, provokedBy e reviveAttempt do próximo jogador
    const updatedState = {
      ...gameState,
      currentTurnPlayerIndex: nextPlayerIndex,
      turnCount: isNewRound ? gameState.turnCount + 1 : gameState.turnCount,
      activeBoss: updatedBoss, // Atualizar boss com aggro resetado
      // Resetar tentativas de levantar do próximo jogador
      players: updatedPlayers.map((player, idx) => {
        if (idx === nextPlayerIndex) {
          // Resetar ações, defesas, tentativas de levantar e remover status expirados dos Digimons do próximo jogador
          // MANTÉM provocação - ela só expira quando o provocado atacar
          const newTurnCount = isNewRound
            ? gameState.turnCount + 1
            : gameState.turnCount;
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              // Remover status expirados
              const withoutExpiredStatuses = removeExpiredStatuses(
                d,
                newTurnCount
              );

              // Reverter evoluções temporárias expiradas (Spirit/Armor)
              const withoutExpiredEvolution = revertTemporaryEvolution(
                withoutExpiredStatuses,
                newTurnCount
              );

              return {
                ...withoutExpiredEvolution,
                hasActedThisTurn: false,
                defending: null, // Resetar defesa
                reviveAttemptedThisTurn: false, // Resetar tentativa de levantar
                // provokedBy: NÃO resetar - mantém até o próximo turno do provocado
              };
            }),
          };
        }
        return player;
      }),
    };

    saveGameState(updatedState);
    // Toast removido - menos invasivo
  };

  const handleDigimonClick = (
    digimon: GameDigimon,
    playerName: string,
    playerId: number
  ) => {
    // Se o Digimon está nocauteado, verificar se pode tentar levantar
    if (digimon.currentHp <= 0) {
      // Verificar se já tentou levantar este Digimon neste turno
      if (digimon.reviveAttemptedThisTurn) {
        enqueueSnackbar(
          `⚠️ Você já tentou levantar ${capitalize(digimon.name)} neste turno!`,
          {
            variant: "warning",
          }
        );
        return;
      }

      // Verificar se é o turno do jogador dono do Digimon
      const currentPlayer =
        gameState?.players[gameState.currentTurnPlayerIndex];
      if (currentPlayer?.id !== playerId) {
        enqueueSnackbar("⚠️ Você só pode reviver Digimons no seu turno!", {
          variant: "warning",
        });
        return;
      }

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

  const applyDamageToDigimon = (
    digimon: GameDigimon,
    damageAmount: number,
    damageDealt: number = 0 // Dano causado pelo Digimon (opcional)
  ) => {
    if (!gameState)
      return {
        newHp: digimon.currentHp,
        evolutionUnlocked: false,
        xpGained: 0,
        newProgress: digimon.evolutionProgress || 0,
      };

    let evolutionUnlocked = false;

    // Calcular nova HP
    const newHp = Math.max(0, digimon.currentHp - damageAmount);

    // Calcular % de HP perdido NESTA BATALHA (recebeu dano)
    // 1% de XP para cada 1% de HP perdido
    const hpLostPercentage = (damageAmount / digimon.dp) * 100;

    // Calcular XP por dano causado
    // XP = metade do dano causado (convertido em %)
    // Exemplo: 400 de dano em um Digimon de 2000 DP = (400/2)/2000 * 100 = 10% XP
    const damageDealtXp = (damageDealt / 2 / digimon.dp) * 100;

    // Verificar se Digimon pode ganhar XP (apenas se tem evoluções disponíveis E não está bloqueado)
    const hasEvolutions = digimon.evolution && digimon.evolution.length > 0;
    const isEvolutionLocked = digimon.evolutionLocked || false;
    const canGainXp = hasEvolutions && !isEvolutionLocked;

    // Ganho de XP: HP perdido (1:1) + Dano causado (metade = XP)
    // Se o Digimon tem Digivice, XP é DOBRADO!
    const baseXpGain = canGainXp ? hpLostPercentage + damageDealtXp : 0;
    const xpGained = digimon.hasDigivice ? baseXpGain * 2 : baseXpGain;

    // Calcular novo progresso de evolução
    const currentProgress = digimon.evolutionProgress || 0;
    const newProgress = canGainXp
      ? Math.min(100, currentProgress + xpGained)
      : 0;

    // Rolar D100 para verificar evolução (se tem XP acumulado e ainda não pode evoluir)
    // MUDANÇA: Verifica evolução com base no XP TOTAL (newProgress), não apenas se ganhou XP agora
    if (!digimon.canEvolve && newProgress > 0 && newHp > 0 && hasEvolutions) {
      // Verificar cooldown de evolução (2 turnos desde a última evolução)
      const currentTurn = gameState.turnCount;
      const lastEvolution = digimon.lastEvolutionTurn || 0;
      const turnosSinceEvolution = currentTurn - lastEvolution;
      const evolutionCooldown = 2; // Mínimo de 2 turnos entre evoluções

      if (turnosSinceEvolution >= evolutionCooldown) {
        const roll = Math.floor(Math.random() * 100) + 1;

        if (roll <= newProgress) {
          evolutionUnlocked = true;
          enqueueSnackbar(
            `🌟 EVOLUÇÃO LIBERADA! ${capitalize(
              digimon.name
            )} pode evoluir! (D100: ${roll}/${newProgress.toFixed(0)}%)`,
            { variant: "success" }
          );
        } else {
          // Falhou, mas tem XP acumulado
        }
      } else {
        // Em cooldown de evolução
        const turnsRemaining = evolutionCooldown - turnosSinceEvolution;
      }
    }

    return { newHp, evolutionUnlocked, xpGained, newProgress };
  };

  const handleAttackConfirm = (
    targetDigimon: GameDigimon,
    attackerDamage: number,
    defenderDamage: number,
    battleResult: BattleResult
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

    // Verificar se é ataque ao boss (ID negativo)
    if (targetDigimon.id < 0 && gameState.activeBoss) {
      console.log("👹 [BOSS ATTACK] Detectado ataque ao boss!");
      handleBossAttackConfirm(targetDigimon, attackerDamage, defenderDamage);
      return;
    }

    console.log("✅ [ATTACK] Validação passou! Processando ataque...");
    console.log("🎯 [ATTACK] Alvo:", targetDigimon.name);

    // Aplicar dano ao alvo (apenas o defensor recebe dano)
    const defenderResult = applyDamageToDigimon(
      targetDigimon,
      attackerDamage,
      0 // Defensor não causou dano
    );
    console.log("🛡️ [ATTACK] Resultado alvo:", defenderResult);

    // Atacante não recebe dano. Apenas ganha XP proporcional ao dano que causou
    const attackerResult = applyDamageToDigimon(
      attackerDigimon.digimon,
      0,
      attackerDamage
    );
    console.log("⚔️ [ATTACK] Resultado atacante:", attackerResult);

    // Processar status baseados em críticos
    console.log("🎲 [STATUS] Verificando críticos...");

    // Atualizar o gameState com os danos aplicados, status e marcar como agiu
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => ({
        ...player,
        digimons: player.digimons.map((d) => {
          // Atualizar alvo (defensor)
          if (d.id === targetDigimon.id) {
            console.log("🎯 [ATTACK] Atualizando alvo:", d.name);
            const newHp = defenderResult.newHp;
            let updatedDigimon: GameDigimon = {
              ...d,
              currentHp: newHp,
              evolutionProgress: defenderResult.newProgress,
              canEvolve: defenderResult.evolutionUnlocked
                ? true
                : d.canEvolve || false,
              defending: null, // Remove defesa ao ser atacado (interceptou)
              // Se morreu, remove provocações feitas por ele
              provokedBy: newHp <= 0 ? null : d.provokedBy,
            };

            // Aplicar status baseado nos resultados dos dados do DEFENSOR
            if (newHp > 0) {
              // Defensor tirou 20 → ganha Animado
              if (battleResult.defenderCriticalSuccess) {
                console.log("💪 [STATUS] Defensor tirou 20! Ganha Animado");
                updatedDigimon = addOrRenewStatus(
                  updatedDigimon,
                  "animado",
                  gameState.turnCount
                );
              }
              // Defensor tirou 1 → ganha Medo
              if (battleResult.defenderCriticalFail) {
                console.log("😰 [STATUS] Defensor tirou 1! Ganha Medo");
                updatedDigimon = addOrRenewStatus(
                  updatedDigimon,
                  "medo",
                  gameState.turnCount
                );
              }
              // Defensor levou crítico (atacante tirou 20) → ganha Medo
              if (battleResult.attackerCriticalSuccess) {
                console.log("😰 [STATUS] Defensor levou crítico! Ganha Medo");
                updatedDigimon = addOrRenewStatus(
                  updatedDigimon,
                  "medo",
                  gameState.turnCount
                );
              }
            }

            return updatedDigimon;
          }
          // Atualizar atacante E marcar como já agiu
          if (d.id === attackerDigimon.digimon.id) {
            const newHp = attackerResult.newHp;
            let updatedDigimon: GameDigimon = {
              ...d,
              currentHp: newHp,
              evolutionProgress: attackerResult.newProgress,
              canEvolve: attackerResult.evolutionUnlocked
                ? true
                : d.canEvolve || false,
              hasActedThisTurn: true, // Marcar como agiu aqui!
              // Remove provocação após atacar OU se morreu
              provokedBy: null, // Sempre remove após atacar
            };

            // Aplicar status baseado nos resultados dos dados do ATACANTE
            if (newHp > 0) {
              // Atacante tirou 20 → ganha Animado
              if (battleResult.attackerCriticalSuccess) {
                console.log("💪 [STATUS] Atacante tirou 20! Ganha Animado");
                updatedDigimon = addOrRenewStatus(
                  updatedDigimon,
                  "animado",
                  gameState.turnCount
                );
              }
              // Atacante tirou 1 → ganha Medo
              if (battleResult.attackerCriticalFail) {
                console.log("😰 [STATUS] Atacante tirou 1! Ganha Medo");
                updatedDigimon = addOrRenewStatus(
                  updatedDigimon,
                  "medo",
                  gameState.turnCount
                );
              }
              // Atacante levou crítico (defensor tirou 20) → ganha Medo
              if (battleResult.defenderCriticalSuccess) {
                console.log("😰 [STATUS] Atacante levou crítico! Ganha Medo");
                updatedDigimon = addOrRenewStatus(
                  updatedDigimon,
                  "medo",
                  gameState.turnCount
                );
              }
            }

            return updatedDigimon;
          }
          // Liberar provocações se o provocador morreu
          if (d.provokedBy === targetDigimon.id && defenderResult.newHp <= 0) {
            return {
              ...d,
              provokedBy: null,
            };
          }
          if (
            d.provokedBy === attackerDigimon.digimon.id &&
            attackerResult.newHp <= 0
          ) {
            return {
              ...d,
              provokedBy: null,
            };
          }
          return d;
        }),
      })),
    };

    console.log("💾 [ATTACK] Chamando saveGameState...");
    saveGameState(updatedState);

    // Toasts removidos - menos invasivo

    // Não fechar o modal automaticamente - deixar usuário ver os resultados
  };

  const handleEvolve = async (digimon: GameDigimon) => {
    if (!gameState || !digimon.canEvolve) return;

    try {
      // Buscar TODAS as evoluções possíveis para mostrar na animação
      const response = await fetch("/api/digimons/evolutions", {
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
      const { animationOptions, finalEvolution } = data;

      // Mostrar animação de evolução com opções variadas e a evolução final
      setEvolvingDigimon({
        digimon,
        evolution: finalEvolution,
        allOptions: animationOptions, // Usa animationOptions que inclui Digimons extras
        evolutionType: data.wasInEvolutionLine
          ? "linha evolutiva"
          : "evolução aleatória",
      });
    } catch (error) {
      enqueueSnackbar("Erro ao processar evolução", { variant: "error" });
    }
  };

  const executeEvolution = async () => {
    if (!gameState || !evolvingDigimon || !evolvingDigimon.evolution) return;

    const digimon = evolvingDigimon.digimon;
    let evolution = evolvingDigimon.evolution;

    try {
      // Encontrar o jogador dono do Digimon
      const ownerPlayer = gameState.players.find((p) =>
        p.digimons.some((d) => d.id === digimon.id)
      );

      // Adicionar pontuação ao Tamer (se não for nível 3)
      if (ownerPlayer && evolution.level !== 3) {
        updateTamerScore(ownerPlayer.id, evolution.dp);
      }

      // Evitar duplicatas em campo: coletar IDs já presentes (inclui boss)
      const existingIds = new Set<number>();
      gameState.players.forEach((p) =>
        p.digimons.forEach((d) => existingIds.add(d.id))
      );
      if (gameState.activeBoss) existingIds.add(gameState.activeBoss.id);

      // Se a evolução escolhida já existe em campo, tentar achar alternativa nas opções de animação
      if (existingIds.has(evolution.id)) {
        const alt = (evolvingDigimon.allOptions || []).find(
          (ev) => !existingIds.has(ev.id)
        );
        if (alt) {
          evolution = alt as typeof evolution;
        } else {
          enqueueSnackbar(
            `⚠️ Não há forma disponível sem duplicar em campo. Evolução adiada.`,
            { variant: "warning" }
          );
          setEvolvingDigimon(null);
          return;
        }
      }

      // Atualizar o Digimon no gameState e resetar defesas que apontam para ele
      const updatedState = {
        ...gameState,
        players: gameState.players.map((player) => ({
          ...player,
          digimons: player.digimons.map((d) => {
            if (d.id === digimon.id) {
              // Verificar se é evolução temporária (Spirit nível 8 ou Armor nível 0)
              const isTemporaryEvolution =
                evolution.level === 0 || evolution.level === 8;

              // Para Armor (nível 0), usar stats dinâmicos baseados no nível mais alto em jogo
              let hp: number, dp: number;

              if (evolution.level === 0) {
                // Encontrar o nível mais alto entre Digimons e Boss
                let highestLevel = 1;

                // Verificar Digimons de todos os jogadores
                gameState.players.forEach((p) => {
                  p.digimons.forEach((dig) => {
                    if (dig.level > highestLevel) {
                      highestLevel = dig.level;
                    }
                  });
                });

                // Verificar Boss se existir
                if (gameState.activeBoss && !gameState.activeBoss.isDefeated) {
                  if (gameState.activeBoss.level > highestLevel) {
                    highestLevel = gameState.activeBoss.level;
                  }
                }

                // Gerar stats de Armor baseados no nível mais alto
                const armorStats = generateArmorStats(highestLevel);
                hp = armorStats.hp;
                dp = armorStats.dp;
              } else {
                // Evoluções normais usam stats aleatórios do nível
                const stats = generateRandomStats(evolution.level);
                hp = stats.hp;
                dp = stats.dp;
              }

              // Evoluir o Digimon com stats do banco ou gerados
              // Priorizar stats do banco (hp, atk, def), fallback para gerados
              const evolutionData = evolution as unknown as {
                hp?: number;
                atk?: number;
                def?: number;
                attribute_id?: number;
              };
              const evolutionHp = evolutionData.hp ?? hp;
              const evolutionAtk =
                evolutionData.atk ?? Math.floor(evolutionHp / 3);
              const evolutionDef =
                evolutionData.def ?? Math.floor(evolutionHp / 4);

              // Limpar TODOS os status e adicionar novo Animado
              // Evoluir renova completamente, não acumula buffs antigos
              const newStatuses = [
                {
                  type: "animado" as const,
                  endsAtTurn: gameState.turnCount + 3,
                },
              ];

              // Calcular HP proporcional + 30% USANDO evolutionHp como base
              // Se tinha 100 HP de 1000 (10%), no novo HP de 3000 terá 300 (10%) + 30% = 390
              const currentHpPercentage =
                d.dp > 0 ? Math.min(1, d.currentHp / d.dp) : 0; // Limitar a 100%
              const proportionalHp = Math.floor(
                evolutionHp * currentHpPercentage
              );
              const bonusHp = Math.floor(evolutionHp * 0.3); // 30% do novo HP máximo
              let newCurrentHp = proportionalHp + bonusHp;

              // GARANTIR que NUNCA ultrapasse o HP máximo
              newCurrentHp = Math.max(1, Math.min(evolutionHp, newCurrentHp));

              // Preparar dados de evolução temporária se for Spirit/Armor
              const temporaryEvolutionData = isTemporaryEvolution
                ? {
                    expiresAtTurn: gameState.turnCount + 3, // Expira em 3 turnos
                    previousForm: {
                      id: d.id,
                      name: d.name,
                      image: d.image,
                      level: d.level,
                      dp: d.dp,
                      currentHp: d.currentHp,
                      typeId: d.typeId,
                      evolutionProgress: d.evolutionProgress || 0,
                    },
                  }
                : undefined;

              return {
                ...d,
                id: evolution.id,
                name: evolution.name,
                image: evolution.image,
                level: evolution.level,
                baseDp: evolutionHp, // HP como base (compatibilidade)
                dpBonus: 0, // Resetar bônus na evolução
                dp: evolutionHp, // DP total = HP do banco
                atk: evolutionAtk, // ATK do banco ou gerado
                def: evolutionDef, // DEF do banco ou gerado
                typeId: evolution.typeId,
                attributeId: evolutionData.attribute_id ?? d.attributeId,
                currentHp: newCurrentHp, // HP proporcional + 30% de bônus
                canEvolve: false, // Reset da flag de evolução
                evolutionProgress: 0, // Resetar XP de evolução
                originalId: d.originalId || digimon.id, // Guardar ID original
                statuses: newStatuses, // Remove debuffs, mantém buffs, adiciona Animado
                lastEvolutionTurn: gameState.turnCount, // Marcar turno da evolução
                temporaryEvolution: temporaryEvolutionData, // Dados de reversão se temporário
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

      // Toast removido - animação já mostra a evolução

      // Notificar que ganhou Animado
      enqueueSnackbar(
        `💪 ${capitalize(
          evolution.name
        )} está Animado! (+20 de dano por 3 turnos)`,
        { variant: "success" }
      );

      // Resetar estado de evolução
      setEvolvingDigimon(null);

      // Não fecha o modal - mantém aberto com dados atualizados
      // O modal já atualiza automaticamente pois busca do gameState
    } catch (error) {
      enqueueSnackbar("Erro ao processar evolução", { variant: "error" });
      setEvolvingDigimon(null);
    }
  };

  // ============= FUNÇÕES DE BOSS =============

  const handleBossDefeat = async (
    defeatedBoss: GameBoss,
    winnerPlayer: { id: number; name: string; avatar: string }
  ) => {
    try {
      // Buscar drops do boss
      const rewards = await BossManager.calculateBossRewards(defeatedBoss.id);

      if (rewards.length > 0) {
        // Buscar informações dos itens
        const itemPromises = rewards.map((itemId) =>
          fetch(`/api/items/${itemId}`).then((r) => r.json())
        );
        const items = await Promise.all(itemPromises);

        // Mostrar modal de drop
        setBossDropData({
          boss: defeatedBoss,
          winnerName: winnerPlayer.name,
          winnerAvatar: getTamerImagePath(winnerPlayer.avatar),
          drops: items,
        });
        setShowBossDropModal(true);

        enqueueSnackbar(
          `🎁 ${winnerPlayer.name} ganhou ${rewards.length} item(ns)!`,
          { variant: "success" }
        );
      } else {
        // Boss derrotado mas sem drops
        setBossDropData({
          boss: defeatedBoss,
          winnerName: winnerPlayer.name,
          winnerAvatar: getTamerImagePath(winnerPlayer.avatar),
          drops: [],
        });
        setShowBossDropModal(true);
      }
    } catch (error) {}
  };

  const handleAttackBoss = () => {
    if (!gameState || !gameState.activeBoss || !selectedDigimon) return;

    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const attackingDigimon = currentPlayer.digimons.find(
      (d) => d.id === selectedDigimon.digimon.id
    );

    if (!attackingDigimon || attackingDigimon.currentHp <= 0) {
      enqueueSnackbar("Digimon inválido ou nocauteado!", { variant: "error" });
      return;
    }

    if (attackingDigimon.hasActedThisTurn) {
      enqueueSnackbar("Este Digimon já agiu neste turno!", {
        variant: "warning",
      });
      return;
    }

    setIsAttackingBoss(true);

    // Executar ataque inline ao boss
    setTimeout(() => {
      if (!gameState.activeBoss) return;

      const boss = gameState.activeBoss; // Salvar referência local

      // Usar BattleManager para cálculos corretos
      const bossAsDigimon: GameDigimon = {
        id: -1,
        name: boss.name,
        image: boss.image,
        level: boss.level,
        dp: boss.calculatedDp,
        atk: boss.calculatedDp,
        def: 0, // Boss sem defesa
        typeId: boss.typeId,
        currentHp: boss.currentHp,
      };

      const battleManager = new BattleManager(attackingDigimon, bossAsDigimon);
      const battleResult = battleManager.executeBattle();
      const damage = battleResult.attackerDamage;

      const attackerAtk =
        (attackingDigimon as unknown as { atk?: number }).atk ?? 0;

      const getTypeName = (typeId: number) => {
        const typeNames: Record<number, string> = DIGIMON_TYPE_NAMES;
        return typeNames[typeId] || "Unknown";
      };

      // Aplicar dano ao boss
      if (!gameState.activeBoss) return;
      const updatedBoss = { ...gameState.activeBoss };
      updatedBoss.currentHp = Math.max(0, updatedBoss.currentHp - damage);

      // Rastrear aggro
      const attackingDigimonId = attackingDigimon.id;
      const lastAttackers = updatedBoss.lastAttackers || [];
      const existingAttackerIndex = lastAttackers.findIndex(
        (a) => a.digimonId === attackingDigimonId
      );

      if (existingAttackerIndex >= 0) {
        lastAttackers[existingAttackerIndex].damage += damage;
      } else {
        lastAttackers.push({
          digimonId: attackingDigimonId,
          damage: damage,
        });
      }
      updatedBoss.lastAttackers = lastAttackers;

      // Aplicar XP ao atacante
      const attackerResult = applyDamageToDigimon(
        attackingDigimon,
        0, // Boss não contra-ataca
        damage // Dano causado
      );

      // Verificar se boss foi derrotado
      const bossDefeated = updatedBoss.currentHp <= 0;
      if (bossDefeated) {
        updatedBoss.isDefeated = true;
        enqueueSnackbar(
          `💀 ${updatedBoss.name} foi derrotado por ${attackingDigimon.name}!`,
          { variant: "success" }
        );
      }

      // Atualizar estado do jogo
      const updatedState = {
        ...gameState,
        activeBoss: updatedBoss,
        lastBossDefeatedTurn: bossDefeated
          ? gameState.turnCount
          : gameState.lastBossDefeatedTurn,
        bossesDefeated: bossDefeated
          ? (gameState.bossesDefeated || 0) + 1
          : gameState.bossesDefeated || 0,
        players: gameState.players.map((p, idx) => ({
          ...p,
          digimons: p.digimons.map((d) => {
            // Atualizar atacante
            if (
              idx === gameState.currentTurnPlayerIndex &&
              d.id === attackingDigimon.id
            ) {
              return {
                ...d,
                currentHp: d.currentHp, // Manter HP (boss não contra-ataca)
                hasActedThisTurn: true,
                evolutionProgress: attackerResult.newProgress,
                canEvolve: attackerResult.evolutionUnlocked
                  ? true
                  : d.canEvolve || false,
              } as typeof d;
            }
            return d;
          }),
        })),
      };

      saveGameState(updatedState);

      // Mostrar drops se boss foi derrotado
      if (bossDefeated) {
        handleBossDefeat(updatedBoss, currentPlayer);
      }

      // Resetar estados
      setIsAttackingBoss(false);
      setSelectedDigimon(null);
    }, 333); // Delay para animação (2/3 de 500ms)
  };

  const handleBossAttackConfirm = async (
    targetDigimon: GameDigimon,
    attackerDamage: number,
    _defenderDamage: number // Boss não contra-ataca (não usado)
  ) => {
    if (!gameState || !gameState.activeBoss || !attackerDigimon) return;

    const updatedBoss = { ...gameState.activeBoss };
    updatedBoss.currentHp = Math.max(0, updatedBoss.currentHp - attackerDamage);

    // Rastrear dano causado pelo Digimon específico para sistema de aggro
    const attackingDigimonId = attackerDigimon.digimon.id;
    const lastAttackers = updatedBoss.lastAttackers || [];

    // Atualizar ou adicionar dano do Digimon atual
    const existingAttackerIndex = lastAttackers.findIndex(
      (a) => a.digimonId === attackingDigimonId
    );

    if (existingAttackerIndex >= 0) {
      lastAttackers[existingAttackerIndex].damage += attackerDamage;
    } else {
      lastAttackers.push({
        digimonId: attackingDigimonId,
        damage: attackerDamage,
      });
    }

    updatedBoss.lastAttackers = lastAttackers;

    // BOSS NÃO CONTRA-ATACA MAIS!
    // Aplicar XP de evolução baseado no dano causado ao boss
    const attackerResult = applyDamageToDigimon(
      attackerDigimon.digimon,
      0, // Boss não contra-ataca (0 dano recebido)
      attackerDamage // Dano causado ao boss
    );

    // Atualizar HP do Digimon atacante e progresso de evolução
    // Boss não causa dano, mas Digimon ganha XP por atacar
    let updatedPlayers = gameState.players.map((player) => ({
      ...player,
      digimons: player.digimons.map((d) => {
        if (d.id === attackerDigimon.digimon.id) {
          return {
            ...d,
            // HP não muda (boss não contra-ataca)
            hasActedThisTurn: true,
            // Atualizar progresso de evolução e flag canEvolve
            evolutionProgress: attackerResult.newProgress,
            canEvolve: attackerResult.evolutionUnlocked
              ? true
              : d.canEvolve || false,
          };
        }
        return d;
      }),
    }));

    // Verificar se o boss foi derrotado
    if (updatedBoss.currentHp <= 0) {
      updatedBoss.isDefeated = true;

      // Calcular recompensas
      const rewards = await BossManager.calculateBossRewards(
        gameState.activeBoss.id
      );

      enqueueSnackbar(
        `🎉 ${gameState.activeBoss.name} foi derrotado por ${attackerDigimon.playerName}!`,
        { variant: "success" }
      );

      // Habilitar evolução imediata para o Digimon que derrotou o boss
      updatedPlayers = updatedPlayers.map((player) => ({
        ...player,
        digimons: player.digimons.map((d) => {
          if (d.id === attackerDigimon.digimon.id) {
            enqueueSnackbar(
              `✨ ${d.name} pode evoluir imediatamente por derrotar o boss!`,
              { variant: "info" }
            );
            return { ...d, canEvolve: true };
          }
          return d;
        }),
      }));

      // Dar recompensas ao jogador que deu o golpe final
      const killerPlayerIndex = updatedPlayers.findIndex(
        (p) => p.id === gameState.players[gameState.currentTurnPlayerIndex].id
      );

      if (killerPlayerIndex >= 0 && rewards.length > 0) {
        // Buscar dados dos itens
        const itemsPromises = rewards.map((itemId) =>
          fetch(`/api/items/${itemId}`).then((res) => res.json())
        );
        const items = await Promise.all(itemsPromises);

        // Adicionar itens à bag do jogador que derrotou o boss
        const killerPlayer = updatedPlayers[killerPlayerIndex];
        const currentPlayerBag = killerPlayer.bag || [];
        const updatedPlayerBag = [...currentPlayerBag];

        items.forEach((item) => {
          const existingIndex = updatedPlayerBag.findIndex(
            (bagItem) => bagItem.id === item.id
          );
          if (existingIndex !== -1) {
            updatedPlayerBag[existingIndex] = {
              ...updatedPlayerBag[existingIndex],
              quantity: updatedPlayerBag[existingIndex].quantity + 1,
            };
          } else {
            updatedPlayerBag.push({ ...item, quantity: 1 });
          }
        });

        // Atualizar a bag do jogador
        updatedPlayers[killerPlayerIndex] = {
          ...updatedPlayers[killerPlayerIndex],
          bag: updatedPlayerBag,
        };

        // Mostrar modal de drop do boss
        setBossDropData({
          boss: gameState.activeBoss,
          winnerName: attackerDigimon.playerName,
          winnerAvatar: getTamerImagePath(
            gameState.players[gameState.currentTurnPlayerIndex].avatar
          ),
          drops: items,
        });
        setShowBossDropModal(true);

        enqueueSnackbar(
          `🎁 ${attackerDigimon.playerName} ganhou ${rewards.length} item(ns)!`,
          { variant: "success" }
        );

        // Atualizar estado com boss derrotado e players atualizados
        saveGameState({
          ...gameState,
          activeBoss: updatedBoss,
          players: updatedPlayers,
          lastBossDefeatedTurn: gameState.turnCount,
          bossesDefeated: (gameState.bossesDefeated || 0) + 1,
        });
      } else if (killerPlayerIndex >= 0) {
        // Boss derrotado mas sem drops
        setBossDropData({
          boss: gameState.activeBoss,
          winnerName: attackerDigimon.playerName,
          winnerAvatar: getTamerImagePath(
            gameState.players[gameState.currentTurnPlayerIndex].avatar
          ),
          drops: [],
        });
        setShowBossDropModal(true);

        // Atualizar estado com boss derrotado
        saveGameState({
          ...gameState,
          activeBoss: updatedBoss,
          players: updatedPlayers,
          lastBossDefeatedTurn: gameState.turnCount,
          bossesDefeated: (gameState.bossesDefeated || 0) + 1,
        });
      } else {
        // Caso sem killer player definido
        saveGameState({
          ...gameState,
          activeBoss: updatedBoss,
          players: updatedPlayers,
          lastBossDefeatedTurn: gameState.turnCount,
          bossesDefeated: (gameState.bossesDefeated || 0) + 1,
        });
      }
    } else {
      // Boss ainda vivo, apenas atualizar HP
      saveGameState({
        ...gameState,
        activeBoss: updatedBoss,
        players: updatedPlayers,
      });
    }

    // Não fechar o modal automaticamente - deixar o usuário decidir
    // Não limpar estados para manter o modal aberto
  };

  // ============= FIM DAS FUNÇÕES DE BOSS =============

  const updateTamerScore = (tamerId: number, points: number) => {
    try {
      const stored = localStorage.getItem("digimon_tamer_scores");
      const scores = stored ? JSON.parse(stored) : {};

      scores[tamerId] = (scores[tamerId] || 0) + points;

      localStorage.setItem("digimon_tamer_scores", JSON.stringify(scores));
    } catch (error) {}
  };

  const handleRevive = (success: boolean) => {
    if (!gameState || !reviveTarget) return;

    // Marcar tentativa no Digimon específico
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => ({
        ...player,
        digimons: player.digimons.map((d) => {
          // Marcar tentativa de levantar para este Digimon (independente do sucesso)
          if (d.id === reviveTarget.digimon.id) {
            if (success) {
              const revivedHp = Math.max(1, Math.floor(d.dp * 0.2)); // 20% da vida, mínimo 1
              return {
                ...d,
                currentHp: revivedHp,
                canEvolve: false,
                hasActedThisTurn: true, // Sem pontos de ação
                actionPoints: 0, // Garantir que não tem pontos de ação
                reviveAttemptedThisTurn: true, // Marcar tentativa
              };
            }
            // Se falhou, apenas marcar a tentativa
            return {
              ...d,
              reviveAttemptedThisTurn: true,
            };
          }
          return d;
        }),
      })),
    };

    saveGameState(updatedState);

    if (success) {
      enqueueSnackbar(
        `✨ ${capitalize(reviveTarget.name)} foi levantado com ${Math.max(
          1,
          Math.floor(reviveTarget.digimon.dp * 0.2)
        )} HP!`,
        { variant: "success" }
      );
    }

    setReviveTarget(null);
  };

  const handleLoot = async (digimon: GameDigimon) => {
    if (!gameState) return;

    // Verificar se é o turno do jogador e se o Digimon ainda não agiu
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];

    if (!currentPlayer) {
      enqueueSnackbar("Erro: Jogador atual não encontrado", {
        variant: "error",
      });
      return;
    }

    if (!currentPlayer.digimons) {
      enqueueSnackbar("Erro: Digimons do jogador não encontrados", {
        variant: "error",
      });
      return;
    }

    const belongsToPlayer = currentPlayer.digimons.some(
      (d) => d.id === digimon.id
    );
    if (!belongsToPlayer) {
      enqueueSnackbar("Erro: Digimon não pertence ao jogador atual", {
        variant: "error",
      });
      return;
    }

    // Verificar se o Digimon está nocauteado
    if (digimon.currentHp <= 0) {
      enqueueSnackbar(
        `${capitalize(digimon.name)} está nocauteado e não pode explorar!`,
        {
          variant: "warning",
        }
      );
      return;
    }

    if (digimon.hasActedThisTurn) {
      enqueueSnackbar(`${capitalize(digimon.name)} já agiu neste turno!`, {
        variant: "warning",
      });
      return;
    }

    try {
      // Buscar todos os itens disponíveis
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Erro ao buscar itens");
      }
      const allItems = await response.json();

      // Coletar todos os itens únicos já obtidos por TODOS os jogadores
      const obtainedUniqueItems = new Set<number>();
      gameState.players.forEach((player) => {
        const playerBag = player.bag || [];
        playerBag.forEach((bagItem) => {
          // Buscar item original para verificar se é único
          const originalItem = allItems.find(
            (i: { id: number }) => i.id === bagItem.id
          );
          if (originalItem?.unique_item === 1) {
            obtainedUniqueItems.add(bagItem.id);
          }
        });
      });

      // Filtrar itens ATIVOS com dropChance > 0
      // E excluir itens únicos já obtidos
      const availableItems = allItems.filter(
        (item: {
          id: number;
          dropChance?: number;
          active?: boolean;
          unique_item?: number;
        }) =>
          (item.dropChance || 0) > 0 &&
          item.active !== false &&
          !(item.unique_item === 1 && obtainedUniqueItems.has(item.id))
      );

      if (availableItems.length === 0) {
        enqueueSnackbar(
          `🔍 ${capitalize(
            digimon.name
          )} explorou mas não há itens disponíveis no momento.`,
          { variant: "info" }
        );

        // Marcar como agiu mesmo sem itens disponíveis
        const updatedState = {
          ...gameState,
          players: gameState.players.map((player, playerIndex) => {
            if (playerIndex === gameState.currentTurnPlayerIndex) {
              return {
                ...player,
                digimons: player.digimons.map((d) => {
                  if (d.id === digimon.id) {
                    return {
                      ...d,
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
        return;
      }

      // 20% de chance de encontrar algum item
      const foundSomething = Math.random() < 0.2;

      if (!foundSomething) {
        enqueueSnackbar(
          `🔍 ${capitalize(
            digimon.name
          )} explorou a área mas não encontrou nada útil.`,
          { variant: "info" }
        );

        // Marcar como agiu mesmo sem encontrar nada
        const updatedState = {
          ...gameState,
          players: gameState.players.map((player, playerIndex) => {
            if (playerIndex === gameState.currentTurnPlayerIndex) {
              return {
                ...player,
                digimons: player.digimons.map((d) => {
                  if (d.id === digimon.id) {
                    // Ganhar 10% de XP ao explorar (DOBRADO)
                    const xpGainedPercentage = 10; // 10% de XP
                    const newProgress = Math.min(
                      100,
                      (d.evolutionProgress || 0) + xpGainedPercentage
                    );
                    const canEvolve =
                      d.evolution &&
                      d.evolution.length > 0 &&
                      newProgress >= 100 &&
                      !d.evolutionLocked;

                    return {
                      ...d,
                      hasActedThisTurn: true,
                      evolutionProgress: newProgress,
                      canEvolve: canEvolve || d.canEvolve,
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
      } else {
        // Calcular qual item foi encontrado baseado nas probabilidades
        const totalChance = availableItems.reduce(
          (sum: number, item: { dropChance?: number }) =>
            sum + (item.dropChance || 0),
          0
        );
        let randomValue = Math.random() * totalChance;

        let foundItem = null;
        for (const item of availableItems) {
          randomValue -= item.dropChance || 0;
          if (randomValue <= 0) {
            foundItem = item;
            break;
          }
        }

        if (foundItem) {
          // Verificar se é um Digivice
          const isDigivice = foundItem.name === "Digivice";

          // Se for Digivice, verificar se o Digimon já tem um
          if (isDigivice && digimon.hasDigivice) {
            enqueueSnackbar(
              `📱 ${capitalize(
                digimon.name
              )} encontrou um Digivice, mas já possui um! O item foi descartado.`,
              { variant: "info" }
            );

            // Marcar como agiu mas não adicionar o item
            const updatedState = {
              ...gameState,
              players: gameState.players.map((player, playerIndex) => {
                if (playerIndex === gameState.currentTurnPlayerIndex) {
                  return {
                    ...player,
                    digimons: player.digimons.map((d) => {
                      if (d.id === digimon.id) {
                        // Ganhar 10% de XP ao explorar (mesmo sem encontrar item válido) (DOBRADO)
                        const xpGainedPercentage = 10; // 10% de XP
                        const newProgress = Math.min(
                          100,
                          (d.evolutionProgress || 0) + xpGainedPercentage
                        );
                        const canEvolve =
                          d.evolution &&
                          d.evolution.length > 0 &&
                          newProgress >= 100 &&
                          !d.evolutionLocked;

                        return {
                          ...d,
                          hasActedThisTurn: true,
                          evolutionProgress: newProgress,
                          canEvolve: canEvolve || d.canEvolve,
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
            return;
          }

          // Adicionar item à bag do jogador atual
          const currentPlayer =
            gameState.players[gameState.currentTurnPlayerIndex];
          const playerBag = currentPlayer.bag || [];
          const existingItemIndex = playerBag.findIndex(
            (bagItem) => bagItem.id === foundItem.id
          );

          let updatedPlayerBag;
          if (existingItemIndex !== -1 && !isDigivice) {
            // Item já existe, incrementar quantidade (exceto Digivice)
            updatedPlayerBag = playerBag.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            // Novo item, adicionar à bag do jogador
            updatedPlayerBag = [
              ...playerBag,
              {
                ...foundItem,
                quantity: 1,
              },
            ];
          }

          // Atualizar estado com bag do jogador e marcar Digimon como agiu
          // Se for Digivice, marcar hasDigivice = true no Digimon
          const updatedState = {
            ...gameState,
            players: gameState.players.map((player, playerIndex) => {
              if (playerIndex === gameState.currentTurnPlayerIndex) {
                return {
                  ...player,
                  bag: updatedPlayerBag, // Atualizar bag do jogador
                  digimons: player.digimons.map((d) => {
                    if (d.id === digimon.id) {
                      // Ganhar 10% de XP ao explorar (DOBRADO)
                      const xpGainedPercentage = 10; // 10% de XP
                      const newProgress = Math.min(
                        100,
                        (d.evolutionProgress || 0) + xpGainedPercentage
                      );
                      const canEvolve =
                        d.evolution &&
                        d.evolution.length > 0 &&
                        newProgress >= 100 &&
                        !d.evolutionLocked;

                      return {
                        ...d,
                        hasActedThisTurn: true,
                        hasDigivice: isDigivice ? true : d.hasDigivice, // Marcar se encontrou Digivice
                        evolutionProgress: newProgress,
                        canEvolve: canEvolve || d.canEvolve,
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

          // Mensagem mais detalhada sobre o item encontrado
          if (isDigivice) {
            enqueueSnackbar(
              `📱 ${capitalize(
                digimon.name
              )} encontrou um DIGIVICE! XP dobrado permanentemente! 🚀`,
              { variant: "success" }
            );
          } else {
            const itemRarity =
              (foundItem.dropChance || 0) <= 10
                ? "✨ RARO"
                : (foundItem.dropChance || 0) <= 25
                ? "⭐"
                : "";

            enqueueSnackbar(
              `💰 ${capitalize(digimon.name)} encontrou ${itemRarity} ${
                foundItem.name
              }! ${itemRarity ? "Sorte!" : ""}`,
              { variant: "success" }
            );
          }
        }
      }
    } catch (error) {
      enqueueSnackbar("Erro ao explorar", { variant: "error" });
    }
  };

  const handleRest = (digimon: GameDigimon) => {
    if (!gameState) {
      return;
    }

    // Verificar se é o turno do jogador dono do Digimon
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const digimonOwner = gameState.players.find((p) =>
      p.digimons.some(
        (d) => (d.originalId || d.id) === (digimon.originalId || digimon.id)
      )
    );

    if (!digimonOwner || digimonOwner.id !== currentPlayer.id) {
      enqueueSnackbar("Só pode descansar no seu turno!", {
        variant: "warning",
      });
      return;
    }

    // Recuperar 20% do HP máximo (DP)
    const healAmount = Math.floor(digimon.dp * 0.2); // 20% do HP máximo
    const newHp = Math.min(digimon.dp, digimon.currentHp + healAmount);
    const actualHeal = newHp - digimon.currentHp;

    const updatedState = {
      ...gameState,
      players: gameState.players.map((player, playerIndex) => ({
        ...player,
        digimons: player.digimons.map((d, digimonIndex) => {
          // Comparar usando originalId (ou id como fallback) do Digimon passado como parâmetro
          const digimonKey = digimon.originalId || digimon.id;
          const currentKey = d.originalId || d.id;

          if (currentKey === digimonKey) {
            return {
              ...d,
              currentHp: newHp,
              hasActedThisTurn: true,
            };
          }
          return d;
        }),
      })),
    };

    saveGameState(updatedState);
    enqueueSnackbar(
      `💤 ${digimon.name} descansou e recuperou ${actualHeal} HP!`,
      { variant: "success" }
    );
  };

  const handleUseItem = async (digimon: GameDigimon, itemId: number) => {
    if (!gameState || !selectedDigimon) {
      return;
    }

    const item = gameState.sharedBag?.find((i) => i.id === itemId);
    if (!item) {
      enqueueSnackbar("Item não encontrado na bag compartilhada!", {
        variant: "error",
      });
      return;
    }

    // Verificar se o item é do tipo evolution - buscar dados do efeito
    if (item.effectId) {
      try {
        const effectResponse = await fetch(`/api/effects/${item.effectId}`);
        if (effectResponse.ok) {
          const effect = await effectResponse.json();

          // Se é evolução especial, escolher aleatoriamente
          if (effect.type === "evolution") {
            if (!item.targetDigimons || item.targetDigimons.length === 0) {
              enqueueSnackbar(
                "Este item de evolução não tem Digimons configurados!",
                {
                  variant: "error",
                }
              );
              return;
            }

            // Verificar se é um Emblema (effectId 21)
            const isCrest = item.effectId === 21;

            // Se for emblema, validar requisitos
            if (isCrest) {
              // Apenas Digimons Level 3 (Ultimate) podem usar emblemas
              if (digimon.level !== 3) {
                enqueueSnackbar(
                  `${capitalize(
                    digimon.name
                  )} precisa ser Ultimate (Level 3) para usar ${item.name}!`,
                  { variant: "warning" }
                );
                return;
              }

              // Digimons com evolutionLocked (Armor/Spirits) não podem usar emblemas
              if (digimon.evolutionLocked) {
                enqueueSnackbar(
                  `${capitalize(
                    digimon.name
                  )} não pode usar emblemas (evoluiu com Armor/Espírito)!`,
                  { variant: "warning" }
                );
                return;
              }
            }

            // Escolher aleatoriamente um dos Digimons disponíveis
            const randomIndex = Math.floor(
              Math.random() * item.targetDigimons.length
            );
            const targetDigimonId = item.targetDigimons[randomIndex];

            // Aplicar a evolução especial
            await handleApplySpecialEvolution(digimon, item, targetDigimonId);
            return; // Não continua - evolução já foi aplicada
          }
        }
      } catch (error) {}
    }

    // Buscar o efeito do item
    let effect = null;
    if (item.effectId) {
      try {
        const effectResponse = await fetch(`/api/effects/${item.effectId}`);
        if (effectResponse.ok) {
          effect = await effectResponse.json();
        }
      } catch (error) {}
    }

    // Variáveis de estado do item
    let newHp = digimon.currentHp;
    const newDp = digimon.dp;
    const newDpBonus = digimon.dpBonus || 0;
    let newAttackBonus = digimon.attackBonus || 0;
    let newDefenseBonus = digimon.defenseBonus || 0;
    let newMovementBonus = digimon.movementBonus || 0;
    let effectMessage = "";

    const effectValue = item.effectValue || 0;

    // Aplicar efeito baseado no tipo
    if (!effect) {
      effectMessage = `usou ${item.name}`;
    } else {
      switch (effect.type) {
        case "heal":
          // Cura de HP
          const oldHp = newHp;
          newHp = Math.min(digimon.dp, digimon.currentHp + effectValue);
          const healed = newHp - oldHp;
          effectMessage = `restaurou ${healed.toLocaleString()} HP`;
          break;

        case "attack_bonus":
          // Bônus permanente de ataque
          newAttackBonus += effectValue;
          effectMessage = `ganhou +${effectValue} de bônus de ataque permanente!`;
          break;

        case "defense_bonus":
          // Bônus permanente de defesa
          newDefenseBonus += effectValue;
          effectMessage = `ganhou +${effectValue} de bônus de defesa permanente!`;
          break;

        case "movement":
          // Bônus permanente de movimento
          newMovementBonus += effectValue;
          effectMessage = `ganhou +${effectValue} casas de movimento permanente!`;
          break;

        case "buff":
        case "debuff":
        case "damage":
          // Outros efeitos podem ser implementados futuramente
          effectMessage = `usou ${item.name}`;
          break;

        default:
          effectMessage = `usou ${item.name}`;
      }
    }

    // Remover ou decrementar item da bag compartilhada
    const updatedSharedBag = (gameState.sharedBag || [])
      .map((bagItem) => {
        if (bagItem.id === itemId) {
          return bagItem.quantity > 1
            ? { ...bagItem, quantity: bagItem.quantity - 1 }
            : null;
        }
        return bagItem;
      })
      .filter((i) => i !== null) as typeof gameState.sharedBag;

    // Atualizar estado
    const updatedState = {
      ...gameState,
      sharedBag: updatedSharedBag,
      players: gameState.players.map((player) => {
        if (player.id === selectedDigimon.playerId) {
          return {
            ...player,
            digimons: player.digimons.map((d) => {
              if ((d.originalId || d.id) === selectedDigimon.originalId) {
                return {
                  ...d,
                  baseDp: d.baseDp || d.dp, // Inicializar baseDp se não existir
                  dp: newDp,
                  dpBonus: newDpBonus,
                  currentHp: newHp,
                  attackBonus: newAttackBonus,
                  defenseBonus: newDefenseBonus,
                  movementBonus: newMovementBonus,
                  // Usar item NÃO custa mais ação!
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

    // Fechar modal de detalhes para forçar atualização visual
    setSelectedDigimon(null);

    // Mensagem de feedback
    enqueueSnackbar(`✨ ${capitalize(digimon.name)} ${effectMessage}`, {
      variant: "success",
    });

    // Reabrir modal após um pequeno delay para mostrar as atualizações
    setTimeout(() => {
      const updatedDigimon = updatedState.players
        .find((p) => p.id === selectedDigimon.playerId)
        ?.digimons.find(
          (d) => (d.originalId || d.id) === selectedDigimon.originalId
        );

      if (updatedDigimon) {
        setSelectedDigimon({
          digimon: updatedDigimon,
          playerName: selectedDigimon.playerName,
          playerId: selectedDigimon.playerId,
          originalId: updatedDigimon.originalId || updatedDigimon.id,
        });
      }
    }, 100);
  };

  const handleApplySpecialEvolution = async (
    digimon: GameDigimon,
    item: Item,
    targetDigimonId: number
  ) => {
    if (!gameState || !selectedDigimon) return;

    try {
      // Buscar TODOS os Digimons possíveis (para mostrar na animação)
      const allPossibleDigimons = await Promise.all(
        (item.targetDigimons || []).map(async (id) => {
          const res = await fetch(`/api/digimons/${id}`);
          if (res.ok) {
            return await res.json();
          }
          return null;
        })
      );

      const validDigimons = allPossibleDigimons.filter((d) => d !== null);

      // Buscar dados do Digimon de destino específico
      const targetDigimonData = validDigimons.find(
        (d) => d.id === targetDigimonId
      );

      if (!targetDigimonData) {
        enqueueSnackbar(
          `Erro ao buscar dados do Digimon (ID: ${targetDigimonId})`,
          {
            variant: "error",
          }
        );
        return;
      }

      // Verificar se o item é um espírito, armor ou emblema
      const isSpirit = item.effectId === 20; // Espíritos Lendários
      const isCrest = item.effectId === 21; // Emblemas
      const isArmor = item.effectId === 17; // Armor Eggs

      let newDp: number;
      let newHp: number;
      let shouldLockEvolution: boolean;

      if (isCrest) {
        // EMBLEMA: Stats baseados no nível Mega (level 4)
        const megaStats = generateRandomStats(4); // Level 4 = Mega
        newDp = megaStats.dp;
        newHp = megaStats.hp;
        shouldLockEvolution = false; // Emblemas NÃO bloqueiam evolução
      } else {
        // ARMOR/SPIRIT: Poder atual + 2000 (rebalanceado de 6000)
        newDp = digimon.dp + 2000;
        newHp = Math.min(digimon.currentHp + 2000, newDp);
        shouldLockEvolution = true; // Armor/Spirits bloqueiam evolução
      }

      if (shouldLockEvolution) {
      } else {
      }

      // Criar evolução
      const evolution = {
        id: targetDigimonData.id,
        name: targetDigimonData.name,
        image: targetDigimonData.image,
        level: targetDigimonData.level,
        typeId: targetDigimonData.typeId,
        dp: newDp,
        currentHp: newHp,
        evolutionProgress: 0,
        canEvolve:
          targetDigimonData.evolution && targetDigimonData.evolution.length > 0
            ? false
            : false, // Sempre false inicialmente, ganha XP e pode evoluir depois
        evolutionLocked: shouldLockEvolution, // Bloquear apenas para Armor/Spirits
        evolution: targetDigimonData.evolution || [],
      };

      // Remover item da bag compartilhada
      const updatedSharedBag = (gameState.sharedBag || [])
        .map((bagItem) => {
          if (bagItem.id === item.id) {
            return bagItem.quantity > 1
              ? { ...bagItem, quantity: bagItem.quantity - 1 }
              : null;
          }
          return bagItem;
        })
        .filter((i) => i !== null) as typeof gameState.sharedBag;

      // Atualizar estado do jogo com a evolução
      const updatedState = {
        ...gameState,
        sharedBag: updatedSharedBag,
        players: gameState.players.map((player) => {
          if (player.id === selectedDigimon.playerId) {
            return {
              ...player,
              digimons: player.digimons.map((d) => {
                if (
                  (d.originalId || d.id) === (digimon.originalId || digimon.id)
                ) {
                  return {
                    ...d,
                    ...evolution,
                    originalId: d.originalId || d.id, // Preservar ID original
                    baseDp: newDp, // Atualizar baseDp
                    dpBonus: d.dpBonus || 0, // Preservar dpBonus
                    hasDigivice: d.hasDigivice, // Preservar Digivice
                    bag: d.bag || [], // Preservar bag individual
                    defending: d.defending, // Preservar defending
                    provokedBy: d.provokedBy, // Preservar provokedBy
                    lastProvokeTurn: d.lastProvokeTurn, // Preservar lastProvokeTurn
                    statuses: d.statuses || [], // Preservar statuses
                    // Usar item NÃO custa mais ação!
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

      // Mostrar animação de evolução
      setEvolvingDigimon({
        digimon,
        evolution: {
          id: evolution.id,
          name: evolution.name,
          image: evolution.image,
          level: evolution.level,
          dp: evolution.dp,
          typeId: evolution.typeId,
        },
        evolutionType: "special",
        allOptions: validDigimons.map((d) => ({
          id: d.id,
          name: d.name,
          image: d.image,
        })),
      });

      setSelectedDigimon(null);

      enqueueSnackbar(
        `🧬 ${capitalize(digimon.name)} evoluiu para ${capitalize(
          evolution.name
        )} usando ${item.name}!`,
        { variant: "success" }
      );
    } catch (error) {
      enqueueSnackbar("Erro ao aplicar evolução especial", {
        variant: "error",
      });
    }
  };

  const handleDiscardItem = (digimon: GameDigimon, itemId: number) => {
    if (!gameState || !selectedDigimon) {
      return;
    }

    const item = gameState.sharedBag?.find((i) => i.id === itemId);
    if (!item) {
      enqueueSnackbar("Item não encontrado na bag compartilhada!", {
        variant: "error",
      });
      return;
    }

    // Remover item completamente da bag compartilhada
    const updatedSharedBag = (gameState.sharedBag || []).filter(
      (i) => i.id !== itemId
    );

    // Atualizar estado
    const updatedState = {
      ...gameState,
      sharedBag: updatedSharedBag,
    };

    saveGameState(updatedState);
    enqueueSnackbar(`🗑️ ${item.name} descartado da bag compartilhada`, {
      variant: "info",
    });
  };

  // Função removida - bag agora é compartilhada
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGiveItem = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromDigimon: GameDigimon,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toDigimonId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    itemId: number
  ) => {
    enqueueSnackbar("A bag agora é compartilhada por toda a equipe!", {
      variant: "info",
    });
    return;

    /* CÓDIGO ANTIGO DESATIVADO
    if (!gameState || !selectedDigimon) {
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
    // Toast removido - menos invasivo
    */
  };

  const handleDefend = (digimon: GameDigimon, targetDigimonId: number) => {
    if (!gameState || !selectedDigimon) {
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
    // Toast removido - menos invasivo
  };

  const handleProvoke = (digimon: GameDigimon, targetDigimonId: number) => {
    if (!gameState || !selectedDigimon) {
      return;
    }

    // Verificar level mínimo
    if (digimon.level < 2) {
      enqueueSnackbar("Apenas Digimons Level 2+ podem provocar!", {
        variant: "warning",
      });
      return;
    }

    // Verificar cooldown (3 turnos)
    if (
      digimon.lastProvokeTurn &&
      gameState.turnCount - digimon.lastProvokeTurn < 3
    ) {
      const turnsLeft = 3 - (gameState.turnCount - digimon.lastProvokeTurn);
      enqueueSnackbar(
        `Aguarde ${turnsLeft} turno${
          turnsLeft > 1 ? "s" : ""
        } para provocar novamente!`,
        { variant: "warning" }
      );
      return;
    }

    const targetDigimon = gameState.players
      .flatMap((p) => p.digimons)
      .find((d) => d.id === targetDigimonId);

    if (!targetDigimon) {
      enqueueSnackbar("Digimon alvo não encontrado!", { variant: "error" });
      return;
    }

    // Atualizar estado
    const updatedState = {
      ...gameState,
      players: gameState.players.map((player) => ({
        ...player,
        digimons: player.digimons.map((d) => {
          // Atualizar provocador
          if ((d.originalId || d.id) === selectedDigimon.originalId) {
            return {
              ...d,
              lastProvokeTurn: gameState.turnCount,
              hasActedThisTurn: true,
            };
          }
          // Atualizar provocado
          if (d.id === targetDigimonId) {
            return {
              ...d,
              provokedBy: digimon.id,
            };
          }
          return d;
        }),
      })),
    };

    saveGameState(updatedState);
    // Toast removido - menos invasivo
  };

  const handleAttack = (digimon: GameDigimon) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    // Atacante vira o contexto de seleção; targets vão pulsar
    setSelectedDigimon({
      digimon,
      playerName: currentPlayer.name,
      playerId: currentPlayer.id,
      originalId: digimon.originalId || digimon.id,
    });
    setAttackerDigimon({ digimon, playerName: currentPlayer.name });
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
                      parent.innerHTML = `<div class="w-full h-full bg-gray-700"></div>`;
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
                      <div className="w-full h-full bg-gray-600"></div>
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

        {/* Boss Card ou Contagem Regressiva */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          {gameState.activeBoss && !gameState.activeBoss.isDefeated ? (
            <BossCard
              boss={gameState.activeBoss}
              onAttack={handleAttackBoss}
              canAttack={
                !!selectedDigimon &&
                selectedDigimon.digimon.currentHp > 0 &&
                !selectedDigimon.digimon.hasActedThisTurn
              }
              isAttacking={isAttackingBoss}
            />
          ) : (
            (() => {
              // Calcular turnos restantes
              const turnsUntilBoss = BossManager.shouldSpawnBoss(
                gameState.turnCount,
                gameState.lastBossDefeatedTurn,
                gameState.activeBoss
              )
                ? 0
                : gameState.lastBossDefeatedTurn !== undefined
                ? gameState.lastBossDefeatedTurn + 2 - gameState.turnCount
                : 2 - gameState.turnCount;

              return turnsUntilBoss > 0 ? (
                <BossCountdown turnsRemaining={turnsUntilBoss} />
              ) : null;
            })()
          )}
        </div>

        {/* Lista de Jogadores com seus Digimons */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {gameState.players.map((player, playerIndex) => {
            const isCurrentTurn =
              playerIndex === gameState.currentTurnPlayerIndex;

            // Verificar se todos os digimons do jogador estão nocauteados
            const allDigimonsKnockedOut = player.digimons.every(
              (digimon) => digimon.currentHp <= 0
            );

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
                          parent.innerHTML = `<div class="w-full h-full bg-gray-700"></div>`;
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
                    {allDigimonsKnockedOut && (
                      <p className="text-red-400 font-bold text-xs sm:text-sm mt-1 animate-pulse">
                        💀 TODOS OS DIGIMONS NOCAUTEADOS - JOGADOR MORTO
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400 mb-1">Parceiros</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                      {player.digimons.length}
                    </div>
                    {allDigimonsKnockedOut && (
                      <div className="text-xs text-red-400 font-bold mt-1">
                        💀 MORTO
                      </div>
                    )}
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
                          key={`player-${playerIndex}-digimon-${digimon.id}-${
                            digimon.originalId || digimon.id
                          }`}
                          onClick={() =>
                            handleDigimonClick(digimon, player.name, player.id)
                          }
                          className={`bg-gray-700 rounded-lg overflow-hidden border transition-all group cursor-pointer transform hover:scale-105 ${
                            attackerDigimon &&
                            playerIndex !== gameState.currentTurnPlayerIndex &&
                            digimon.currentHp > 0
                              ? "ring-4 ring-red-500 animate-pulse"
                              : ""
                          } ${
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
                            <div
                              className={`relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-gray-600 to-gray-800 overflow-hidden flex-shrink-0 ${
                                attackerDigimon &&
                                playerIndex !==
                                  gameState.currentTurnPlayerIndex &&
                                digimon.currentHp > 0
                                  ? "ring-4 ring-red-500 animate-pulse"
                                  : ""
                              }`}
                              onClick={(e) => {
                                // Se estamos em modo de seleção de ataque e este é um alvo valido
                                if (
                                  attackerDigimon &&
                                  playerIndex !==
                                    gameState.currentTurnPlayerIndex &&
                                  digimon.currentHp > 0
                                ) {
                                  e.stopPropagation();
                                  // Executar ataque usando BattleManager para cálculos corretos
                                  const battleManager = new BattleManager(
                                    attackerDigimon.digimon,
                                    digimon
                                  );

                                  const battleResult =
                                    battleManager.executeBattle();
                                  const damage = battleResult.attackerDamage;

                                  const attackerAtk =
                                    (
                                      attackerDigimon.digimon as unknown as {
                                        atk?: number;
                                      }
                                    ).atk ?? 0;
                                  const defenderDef =
                                    (digimon as unknown as { def?: number })
                                      .def ?? 0;

                                  const getTypeName = (typeId: number) => {
                                    const typeNames: Record<number, string> =
                                      DIGIMON_TYPE_NAMES;
                                    return typeNames[typeId] || "Unknown";
                                  };

                                  // Mostrar indicador de dano
                                  setRecentDamage({
                                    digimonId: digimon.id,
                                    damage: damage,
                                    timestamp: Date.now(),
                                  });

                                  // Aplicar dano e fechar seleção
                                  const defenderResult = applyDamageToDigimon(
                                    digimon,
                                    damage,
                                    damage
                                  );

                                  // Atualizar estado com resultado do ataque simples por turno
                                  if (gameState) {
                                    const updatedState = {
                                      ...gameState,
                                      players: gameState.players.map(
                                        (p, idx) => ({
                                          ...p,
                                          digimons: p.digimons.map((d) => {
                                            // Atualizar alvo (defensor)
                                            if (
                                              idx === playerIndex &&
                                              d.id === digimon.id
                                            ) {
                                              return {
                                                ...d,
                                                currentHp: defenderResult.newHp,
                                                evolutionProgress:
                                                  defenderResult.newProgress,
                                                canEvolve:
                                                  defenderResult.evolutionUnlocked
                                                    ? true
                                                    : d.canEvolve || false,
                                                defending: null,
                                                provokedBy:
                                                  defenderResult.newHp <= 0
                                                    ? null
                                                    : d.provokedBy,
                                              } as typeof d;
                                            }

                                            // Marcar atacante como tendo agido
                                            if (
                                              idx ===
                                                gameState.currentTurnPlayerIndex &&
                                              d.id ===
                                                attackerDigimon.digimon.id
                                            ) {
                                              return {
                                                ...d,
                                                hasActedThisTurn: true,
                                              } as typeof d;
                                            }
                                            return d;
                                          }),
                                        })
                                      ),
                                    };
                                    saveGameState(updatedState);
                                  }

                                  // Sair do modo de seleção de ataque
                                  setAttackerDigimon(null);
                                  return;
                                }
                              }}
                            >
                              {isDead && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                                  <div className="text-center">
                                    <div className="text-3xl mb-1">😵</div>
                                    <p className="text-orange-400 font-bold text-xs">
                                      NOCAUTEADO
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
                                      : (digimon as { active?: boolean })
                                          .active === false
                                      ? {
                                          filter:
                                            "grayscale(100%) opacity(0.6)",
                                        }
                                      : digimon.hasActedThisTurn &&
                                        playerIndex ===
                                          gameState.currentTurnPlayerIndex
                                      ? {
                                          filter: "grayscale(100%)",
                                        }
                                      : undefined
                                  }
                                  title={
                                    (digimon as { active?: boolean }).active ===
                                    false
                                      ? `⚠️ ${digimon.name} (Inativo - Não disponível no Time Stranger)`
                                      : digimon.name
                                  }
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-600"></div>
                              )}

                              {/* Indicador de Dano Recente */}
                              {recentDamage &&
                                recentDamage.digimonId === digimon.id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none animate-pulse">
                                    <div className="text-red-500 font-bold text-2xl sm:text-3xl md:text-4xl drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)] animate-bounce">
                                      -{recentDamage.damage}
                                    </div>
                                  </div>
                                )}

                              {/* Badge de Level */}
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1 py-0.5 rounded">
                                {getLevelName(digimon.level)}
                              </div>

                              {/* Ícones de Status e Provocação - Na imagem do Digimon */}
                              {!isDead && (
                                <div className="absolute top-1 right-1 flex flex-col gap-1 pointer-events-none">
                                  {/* Digivice - SEMPRE NO TOPO */}
                                  {digimon.hasDigivice && (
                                    <div
                                      className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse"
                                      title="📱 Digivice Equipado - XP Dobrado!"
                                    >
                                      <span className="text-sm">📱</span>
                                    </div>
                                  )}

                                  {/* Status: Animado e Medo */}
                                  {digimon.statuses &&
                                    digimon.statuses.map((status, idx) => (
                                      <div
                                        key={`${status.type}-${idx}`}
                                        className="relative group/status"
                                        title={
                                          status.type === "animado"
                                            ? `💪 Animado: +20 de dano (Expira no turno ${status.endsAtTurn})`
                                            : `😰 Medo: -20 de dano (Expira no turno ${status.endsAtTurn})`
                                        }
                                      >
                                        <div
                                          className={`text-xl animate-pulse ${
                                            status.type === "animado"
                                              ? "text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,1)]"
                                              : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,1)]"
                                          }`}
                                        >
                                          {status.type === "animado"
                                            ? "💪"
                                            : "😰"}
                                        </div>
                                      </div>
                                    ))}

                                  {/* Provocação */}
                                  {(() => {
                                    const provoker = gameState.players
                                      .flatMap((p) => p.digimons)
                                      .find(
                                        (d) =>
                                          d.id === digimon.provokedBy &&
                                          d.currentHp > 0
                                      );
                                    return (
                                      provoker && (
                                        <div
                                          className="text-orange-400 text-xl animate-pulse drop-shadow-[0_0_6px_rgba(251,146,60,1)]"
                                          title={`💢 Provocado por ${capitalize(
                                            provoker.name
                                          )}`}
                                        >
                                          💢
                                        </div>
                                      )
                                    );
                                  })()}
                                </div>
                              )}

                              {/* Badge de Evolução Temporária */}
                              {digimon.temporaryEvolution && (
                                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-lg border border-purple-400 animate-pulse z-10">
                                  ⏰{" "}
                                  {Math.max(
                                    0,
                                    digimon.temporaryEvolution.expiresAtTurn -
                                      gameState.turnCount
                                  )}
                                  T
                                </div>
                              )}

                              {/* Badge de Evolução Liberada */}
                              {digimon.canEvolve && !isDead && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                                  ✨
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
                                  <div
                                    className={`${getTypeColor(
                                      digimon.typeId
                                    )} text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap flex items-center gap-1`}
                                  >
                                    <TypeIcon
                                      typeId={digimon.typeId}
                                      size={10}
                                      className="text-white"
                                    />
                                    {
                                      DIGIMON_TYPE_NAMES[
                                        digimon.typeId as keyof typeof DIGIMON_TYPE_NAMES
                                      ]
                                    }
                                  </div>
                                  <div className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                    ⚔️{" "}
                                    {(
                                      (digimon as any).atk ||
                                      calculatePowerWithBonus(
                                        digimon.dp,
                                        digimon.attackBonus || 0
                                      )
                                    ).toLocaleString()}{" "}
                                    ATK
                                  </div>
                                </div>

                                {/* Texto de Provocação - Abaixo do tipo */}
                                {(() => {
                                  const provoker = gameState.players
                                    .flatMap((p) => p.digimons)
                                    .find(
                                      (d) =>
                                        d.id === digimon.provokedBy &&
                                        d.currentHp > 0
                                    );
                                  return (
                                    provoker &&
                                    !isDead && (
                                      <div className="text-orange-400 text-[10px] sm:text-xs font-bold animate-pulse mb-1">
                                        Provocado por{" "}
                                        {capitalize(provoker.name)}
                                      </div>
                                    )
                                  );
                                })()}
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

                                {/* Barra de Evolução (XP) + Ações rápidas */}
                                {!isDead && (
                                  <div className="mt-1 space-y-1">
                                    {/* XP */}

                                    <div className="w-full mt-2 bg-gray-600 rounded-full h-1.5 sm:h-2 overflow-hidden border border-gray-500 shadow-inner">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                                        style={{
                                          width: `${
                                            digimon.evolutionProgress || 0
                                          }%`,
                                        }}
                                      />
                                    </div>

                                    {/* Ações em linha (somente ícones) */}
                                    {playerIndex ===
                                      gameState.currentTurnPlayerIndex && (
                                      <div className="flex items-center gap-1 justify-between w-full">
                                        {/* Atacar */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDigimon({
                                              digimon,
                                              playerName: player.name,
                                              playerId: player.id,
                                              originalId:
                                                digimon.originalId ||
                                                digimon.id,
                                            });
                                            handleAttack(digimon);
                                          }}
                                          disabled={
                                            isDead || digimon.hasActedThisTurn
                                          }
                                          className={`cursor-pointer p-1 rounded text-[12px] shadow  ${
                                            isDead || digimon.hasActedThisTurn
                                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                              : "bg-red-600 text-white hover:bg-red-700"
                                          }`}
                                          title="Atacar"
                                        >
                                          ⚔️
                                        </button>
                                        {/* Descansar */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDigimon({
                                              digimon,
                                              playerName: player.name,
                                              playerId: player.id,
                                              originalId:
                                                digimon.originalId ||
                                                digimon.id,
                                            });
                                            handleRest(digimon);
                                          }}
                                          disabled={
                                            isDead || digimon.hasActedThisTurn
                                          }
                                          className={`cursor-pointer p-1 rounded text-[12px] shadow ${
                                            isDead || digimon.hasActedThisTurn
                                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                              : "bg-green-600 text-white hover:bg-green-700"
                                          }`}
                                          title="Descansar"
                                        >
                                          😴
                                        </button>
                                        {/* Explorar */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDigimon({
                                              digimon,
                                              playerName: player.name,
                                              playerId: player.id,
                                              originalId:
                                                digimon.originalId ||
                                                digimon.id,
                                            });
                                            handleLoot(digimon);
                                          }}
                                          disabled={
                                            isDead || digimon.hasActedThisTurn
                                          }
                                          className={`cursor-pointer p-1 rounded text-[12px] shadow ${
                                            isDead || digimon.hasActedThisTurn
                                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                              : "bg-yellow-600 text-white hover:bg-yellow-700"
                                          }`}
                                          title="Explorar"
                                        >
                                          💰
                                        </button>
                                        {/* Defender */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDigimon({
                                              digimon,
                                              playerName: player.name,
                                              playerId: player.id,
                                              originalId:
                                                digimon.originalId ||
                                                digimon.id,
                                            });
                                            setShowDefendPickerId(digimon.id);
                                          }}
                                          disabled={
                                            isDead || digimon.hasActedThisTurn
                                          }
                                          className={`cursor-pointer p-1 rounded text-[12px] shadow ${
                                            isDead || digimon.hasActedThisTurn
                                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                              : "bg-cyan-600 text-white hover:bg-cyan-700"
                                          }`}
                                          title="Defender aliado"
                                        >
                                          🛡️
                                        </button>
                                        {/* Provocar */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDigimon({
                                              digimon,
                                              playerName: player.name,
                                              playerId: player.id,
                                              originalId:
                                                digimon.originalId ||
                                                digimon.id,
                                            });
                                            setShowProvokePickerId(digimon.id);
                                          }}
                                          disabled={isDead}
                                          className={`cursor-pointer p-1 rounded text-[12px] shadow ${
                                            isDead
                                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                              : "bg-orange-600 text-white hover:bg-orange-700"
                                          }`}
                                          title="Provocar inimigo"
                                        >
                                          💢
                                        </button>
                                        {/* Evoluir */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDigimon({
                                              digimon,
                                              playerName: player.name,
                                              playerId: player.id,
                                              originalId:
                                                digimon.originalId ||
                                                digimon.id,
                                            });
                                            handleEvolve(digimon);
                                          }}
                                          disabled={!digimon.canEvolve}
                                          className={`cursor-pointer p-1 rounded text-[12px] shadow ${
                                            digimon.canEvolve
                                              ? "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white"
                                              : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                          }`}
                                          title={
                                            digimon.canEvolve
                                              ? "Evoluir"
                                              : "Evolução bloqueada"
                                          }
                                        >
                                          ✨
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
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

      {/* Modal de Detalhes removido: ações inline nos cards */}

      {/* Ataque inline: sem modal */}

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

      {/* Animação de Evolução */}
      <EvolutionAnimation
        isOpen={evolvingDigimon !== null}
        digimonName={evolvingDigimon?.digimon.name || ""}
        digimonImage={evolvingDigimon?.digimon.image || ""}
        evolutionImage={evolvingDigimon?.evolution?.image}
        evolutionName={evolvingDigimon?.evolution?.name}
        possibleEvolutions={evolvingDigimon?.allOptions || []}
        onComplete={executeEvolution}
      />

      {/* Tela de Derrota */}
      {gameState?.activeBoss && (
        <DefeatScreen
          isOpen={showDefeatScreen}
          onClose={() => setShowDefeatScreen(false)}
          boss={gameState.activeBoss}
          defeatedPlayers={
            gameState?.players.map((player) => ({
              name: player.name,
              avatar: getTamerImagePath(player.avatar),
              aliveDigimons: player.digimons.filter((d) => d.currentHp > 0)
                .length,
            })) || []
          }
        />
      )}

      {/* Modal de Drop do Boss */}
      {bossDropData && (
        <BossDropModal
          isOpen={showBossDropModal}
          onClose={() => {
            setShowBossDropModal(false);
            setBossDropData(null);
          }}
          boss={bossDropData.boss}
          winnerName={bossDropData.winnerName}
          winnerAvatar={bossDropData.winnerAvatar}
          drops={bossDropData.drops}
        />
      )}
    </div>
  );
}
