import { GameItem } from "./item";
import { Boss } from "./boss";

// Status de combate
export interface DigimonStatus {
  type: "animado" | "medo"; // Tipo do status
  endsAtTurn: number; // Turno global em que o status expira
}

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
  attributeId?: number; // ID do atributo elemental (Fogo, Água, etc)
  currentHp: number; // HP atual do Digimon (inicia igual ao DP)
  canEvolve?: boolean; // Se o Digimon pode evoluir
  evolution?: number[]; // IDs dos Digimons que este pode evoluir
  evolutionLocked?: boolean; // Se as evoluções estão bloqueadas (espíritos/emblemas)
  hasDigivice?: boolean; // Se o Digimon encontrou um Digivice (XP dobrado)
  originalId?: number; // ID original do Digimon (antes das evoluções)
  hasActedThisTurn?: boolean; // Se já realizou uma ação neste turno
  bag?: GameItem[]; // Inventário de itens do Digimon
  defending?: number | null; // ID do Digimon que está sendo defendido
  evolutionProgress?: number; // Progresso de evolução em % (0-100)
  provokedBy?: number | null; // ID do Digimon que provocou este
  lastProvokeTurn?: number | null; // Último turno global que este Digimon provocou
  statuses?: DigimonStatus[]; // Status ativos (animado, medo, etc)
}

export interface GamePlayer {
  id: number;
  name: string;
  avatar: string;
  digimons: GameDigimon[];
}

// Boss ativo no jogo
export interface GameBoss extends Boss {
  level: number; // Nível do boss (para cálculo de Armor)
  currentHp: number; // HP atual do boss
  maxHp: number; // HP máximo calculado (média DP × 3)
  calculatedDp: number; // DP calculado (média dos jogadores vivos)
  spawnedAtTurn: number; // Turno em que o boss nasceu
  isDefeated: boolean; // Se o boss foi derrotado
}

export interface GameState {
  gameId: string;
  createdAt: string;
  players: GamePlayer[];
  currentTurnPlayerIndex: number; // Índice do jogador no turno atual
  turnCount: number; // Contador de turnos
  reviveAttemptThisTurn?: boolean; // Se já tentou reviver neste turno
  activeBoss?: GameBoss | null; // Boss ativo no jogo
  lastBossDefeatedTurn?: number; // Último turno que um boss foi derrotado
  bossesDefeated?: number; // Quantidade de bosses derrotados
  sharedBag?: GameItem[]; // Bag compartilhada entre toda a equipe
}
