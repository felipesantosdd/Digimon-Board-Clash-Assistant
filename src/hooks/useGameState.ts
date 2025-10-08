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

        // Migração: adicionar currentHp, turnCount e currentTurnPlayerIndex se não existirem
        const migratedState: GameState = {
          ...parsed,
          players: parsed.players.map((player) => ({
            ...player,
            digimons: player.digimons.map((digimon) => ({
              ...digimon,
              currentHp: digimon.currentHp ?? digimon.dp, // Se não existir, usa o DP
              canEvolve: digimon.canEvolve ?? false, // Adicionar canEvolve se não existir
              originalId: digimon.originalId ?? digimon.id, // Adicionar originalId se não existir
              hasActedThisTurn: digimon.hasActedThisTurn ?? false, // Adicionar hasActedThisTurn se não existir
              bag: digimon.bag ?? [], // Adicionar bag vazia se não existir
            })),
          })),
          currentTurnPlayerIndex: parsed.currentTurnPlayerIndex ?? 0, // Padrão: primeiro jogador
          turnCount: parsed.turnCount ?? 1, // Padrão: turno 1
        };

        setGameState(migratedState);

        // Salvar estado migrado no localStorage
        if (JSON.stringify(parsed) !== JSON.stringify(migratedState)) {
          localStorage.setItem(GAME_STATE_KEY, JSON.stringify(migratedState));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar estado do jogo:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar estado no localStorage
  const saveGameState = (newState: GameState) => {
    try {
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(newState));
      setGameState(newState);
    } catch (error) {
      console.error("Erro ao salvar estado do jogo:", error);
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
