"use client";

import { useState, useEffect } from "react";
import { GameState } from "@/types/game";

const GAME_STATE_KEY = "digimon_board_clash_game_state";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar estado do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GAME_STATE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as GameState;

        // Migração: adicionar campos novos se não existirem
        const migratedState: GameState = {
          ...parsed,
          players: parsed.players.map((player) => ({
            ...player,
            digimons: player.digimons.map((digimon) => ({
              ...digimon,
              // Inicializar HP/ATK/DEF do novo sistema, com fallback para dp
              currentHp: digimon.currentHp ?? (digimon as any).hp ?? digimon.dp,
              atk: (digimon as any).atk ?? undefined,
              def: (digimon as any).def ?? undefined,
              canEvolve: digimon.canEvolve ?? false, // Adicionar canEvolve se não existir
              evolutionLocked: digimon.evolutionLocked ?? false, // Adicionar evolutionLocked se não existir
              hasDigivice: digimon.hasDigivice ?? false, // Adicionar hasDigivice se não existir
              originalId: digimon.originalId ?? digimon.id, // Adicionar originalId se não existir
              hasActedThisTurn: digimon.hasActedThisTurn ?? false, // Adicionar hasActedThisTurn se não existir
              bag: digimon.bag ?? [], // Adicionar bag vazia se não existir
              defending: digimon.defending ?? null, // Adicionar defending se não existir
              evolutionProgress: digimon.evolutionProgress ?? 0, // Adicionar XP de evolução se não existir
              provokedBy: digimon.provokedBy ?? null, // Adicionar provocação se não existir
              lastProvokeTurn: digimon.lastProvokeTurn ?? null, // Adicionar cooldown de provocação se não existir
              baseDp: digimon.baseDp ?? (digimon as any).hp ?? digimon.dp, // usar hp como base
              dpBonus: digimon.dpBonus ?? 0, // Inicializar dpBonus se não existir
              statuses: digimon.statuses ?? [], // Inicializar statuses se não existir
              attributeId:
                digimon.attributeId ?? (digimon as any).attribute_id ?? 12,
              attackBonus: digimon.attackBonus ?? 0, // Adicionar attackBonus se não existir
              defenseBonus: digimon.defenseBonus ?? 0, // Adicionar defenseBonus se não existir
              movementBonus: digimon.movementBonus ?? 0, // Adicionar movementBonus se não existir
            })),
          })),
          currentTurnPlayerIndex: parsed.currentTurnPlayerIndex ?? 0, // Padrão: primeiro jogador
          turnCount: parsed.turnCount ?? 1, // Padrão: turno 1
          reviveAttemptThisTurn: parsed.reviveAttemptThisTurn ?? false, // Padrão: não tentou reviver
          // Migração de Boss: Limpar bosses criados com sistema antigo (HP > 10k = sistema antigo)
          activeBoss:
            parsed.activeBoss && parsed.activeBoss.maxHp > 10000
              ? (() => {
                  return null; // Remover boss antigo
                })()
              : parsed.activeBoss ?? null,
          lastBossDefeatedTurn: parsed.lastBossDefeatedTurn ?? undefined, // Último turno que derrotou boss
          bossesDefeated: parsed.bossesDefeated ?? 0, // Quantidade de bosses derrotados
        };

        setGameState(migratedState);

        // Salvar estado migrado no localStorage
        if (JSON.stringify(parsed) !== JSON.stringify(migratedState)) {
          localStorage.setItem(GAME_STATE_KEY, JSON.stringify(migratedState));
        }
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar estado no localStorage
  const saveGameState = (newState: GameState) => {
    try {
      const jsonString = JSON.stringify(newState);
      localStorage.setItem(GAME_STATE_KEY, jsonString);

      setGameState(newState);
    } catch (error) {}
  };

  // Limpar estado do jogo
  const clearGameState = () => {
    try {
      localStorage.removeItem(GAME_STATE_KEY);
      setGameState(null);
    } catch (error) {}
  };

  return {
    gameState,
    saveGameState,
    clearGameState,
    isLoading,
  };
}
