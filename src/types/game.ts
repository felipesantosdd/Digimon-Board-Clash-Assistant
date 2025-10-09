import { GameItem } from "./item";

// Tipos para o estado do jogo
export interface GameDigimon {
  id: number;
  name: string;
  image: string;
  level: number;
  dp: number;
  baseDp?: number; // DP base do Digimon (sem buffs)
  dpBonus?: number; // Bônus de DP acumulado (de itens, buffs, etc)
  typeId: number;
  currentHp: number; // HP atual do Digimon (inicia igual ao DP)
  canEvolve?: boolean; // Se o Digimon pode evoluir
  originalId?: number; // ID original do Digimon (antes das evoluções)
  hasActedThisTurn?: boolean; // Se já realizou uma ação neste turno
  bag?: GameItem[]; // Inventário de itens do Digimon
  defending?: number | null; // ID do Digimon que está sendo defendido
  evolutionProgress?: number; // Progresso de evolução em % (0-100)
  provokedBy?: number | null; // ID do Digimon que provocou este
  lastProvokeTurn?: number | null; // Último turno global que este Digimon provocou
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
  reviveAttemptThisTurn?: boolean; // Se já tentou reviver neste turno
}
