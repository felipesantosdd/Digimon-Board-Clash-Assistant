import { GameItem } from "./item";

// Tipos para o estado do jogo
export interface GameDigimon {
  id: number;
  name: string;
  image: string;
  level: number;
  dp: number;
  typeId: number;
  currentHp: number; // HP atual do Digimon (inicia igual ao DP)
  canEvolve?: boolean; // Se o Digimon pode evoluir
  originalId?: number; // ID original do Digimon (antes das evoluções)
  hasActedThisTurn?: boolean; // Se já realizou uma ação neste turno
  bag?: GameItem[]; // Inventário de itens do Digimon
}

export interface GamePlayer {
  id: number;
  name: string;
  avatar: string;
  digimons: GameDigimon[];
}

export interface GameState {
  gameId: string;
  createdAt: string;
  players: GamePlayer[];
  currentTurnPlayerIndex: number; // Índice do jogador no turno atual
  turnCount: number; // Contador de turnos
}
