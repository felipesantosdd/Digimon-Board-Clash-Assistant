"use client";

import { useState, useEffect } from "react";
import { GameState } from "@/types/game";

const GAME_STATE_KEY = "digimon_board_clash_game_state";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar estado do localStorage ao montar
  useEffect(() => {
    console.log("🟢 [LOAD] Iniciando carregamento do estado...");
    try {
      const stored = localStorage.getItem(GAME_STATE_KEY);
      console.log(
        "📂 [LOAD] Dados do localStorage:",
        stored ? `${stored.length} caracteres` : "null"
      );

      if (stored) {
        const parsed = JSON.parse(stored) as GameState;
        console.log("📊 [LOAD] Estado parseado:", parsed);
        console.log(
          "🎮 [LOAD] Players carregados:",
          parsed.players.map((p) => ({
            name: p.name,
            digimons: p.digimons.map((d) => ({
              name: d.name,
              currentHp: d.currentHp,
              hasActedThisTurn: d.hasActedThisTurn,
              canEvolve: d.canEvolve,
              bag: d.bag?.length || 0,
            })),
          }))
        );

        // Migração: adicionar campos novos se não existirem
        const migratedState: GameState = {
          ...parsed,
          players: parsed.players.map((player) => ({
            ...player,
            digimons: player.digimons.map((digimon) => ({
              ...digimon,
              currentHp: digimon.currentHp ?? digimon.dp, // Se não existir, usa o DP
              canEvolve: digimon.canEvolve ?? false, // Adicionar canEvolve se não existir
              evolutionLocked: digimon.evolutionLocked ?? false, // Adicionar evolutionLocked se não existir
              originalId: digimon.originalId ?? digimon.id, // Adicionar originalId se não existir
              hasActedThisTurn: digimon.hasActedThisTurn ?? false, // Adicionar hasActedThisTurn se não existir
              bag: digimon.bag ?? [], // Adicionar bag vazia se não existir
              defending: digimon.defending ?? null, // Adicionar defending se não existir
              evolutionProgress: digimon.evolutionProgress ?? 0, // Adicionar XP de evolução se não existir
              provokedBy: digimon.provokedBy ?? null, // Adicionar provocação se não existir
              lastProvokeTurn: digimon.lastProvokeTurn ?? null, // Adicionar cooldown de provocação se não existir
              baseDp: digimon.baseDp ?? digimon.dp, // Inicializar baseDp se não existir
              dpBonus: digimon.dpBonus ?? 0, // Inicializar dpBonus se não existir
              statuses: digimon.statuses ?? [], // Inicializar statuses se não existir
            })),
          })),
          currentTurnPlayerIndex: parsed.currentTurnPlayerIndex ?? 0, // Padrão: primeiro jogador
          turnCount: parsed.turnCount ?? 1, // Padrão: turno 1
          reviveAttemptThisTurn: parsed.reviveAttemptThisTurn ?? false, // Padrão: não tentou reviver
          activeBoss: parsed.activeBoss ?? null, // Boss ativo
          lastBossDefeatedTurn: parsed.lastBossDefeatedTurn ?? undefined, // Último turno que derrotou boss
          bossesDefeated: parsed.bossesDefeated ?? 0, // Quantidade de bosses derrotados
        };

        console.log("🔄 [LOAD] Estado após migração:", migratedState);
        setGameState(migratedState);
        console.log("✅ [LOAD] Estado carregado no React");

        // Salvar estado migrado no localStorage
        if (JSON.stringify(parsed) !== JSON.stringify(migratedState)) {
          console.log("🔧 [LOAD] Salvando estado migrado...");
          localStorage.setItem(GAME_STATE_KEY, JSON.stringify(migratedState));
        }
      } else {
        console.log("⚠️ [LOAD] Nenhum estado encontrado no localStorage");
      }
    } catch (error) {
      console.error("❌ [LOAD] Erro ao carregar estado do jogo:", error);
    } finally {
      setIsLoading(false);
      console.log("🏁 [LOAD] Carregamento finalizado");
    }
  }, []);

  // Salvar estado no localStorage
  const saveGameState = (newState: GameState) => {
    try {
      console.log("🔵 [SAVE] Salvando estado do jogo...");
      console.log("📊 [SAVE] Estado completo:", newState);
      console.log(
        "🎮 [SAVE] Players:",
        newState.players.map((p) => ({
          name: p.name,
          digimons: p.digimons.map((d) => ({
            name: d.name,
            currentHp: d.currentHp,
            hasActedThisTurn: d.hasActedThisTurn,
            canEvolve: d.canEvolve,
            bag: d.bag?.length || 0,
          })),
        }))
      );

      const jsonString = JSON.stringify(newState);
      localStorage.setItem(GAME_STATE_KEY, jsonString);
      console.log("✅ [SAVE] Estado salvo no localStorage");
      console.log("💾 [SAVE] Tamanho:", jsonString.length, "caracteres");

      setGameState(newState);
      console.log("✅ [SAVE] Estado atualizado no React");
    } catch (error) {
      console.error("❌ [SAVE] Erro ao salvar estado do jogo:", error);
    }
  };

  // Limpar estado do jogo
  const clearGameState = () => {
    try {
      localStorage.removeItem(GAME_STATE_KEY);
      setGameState(null);
    } catch (error) {
      console.error("Erro ao limpar estado do jogo:", error);
    }
  };

  return {
    gameState,
    saveGameState,
    clearGameState,
    isLoading,
  };
}
