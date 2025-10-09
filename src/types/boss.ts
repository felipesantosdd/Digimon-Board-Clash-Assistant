export interface Boss {
  id: number;
  name: string;
  image: string;
  description: string;
  effect?: string; // Deprecated - use effectId
  effectId: number; // ID do efeito na tabela effects
  dp: number;
  typeId: number;
}

export interface BossDrop {
  id: number;
  bossId: number;
  itemId: number;
  dropChance: number; // 1 a 100
}

export interface GameBoss extends Boss {
  currentHp: number;
  isDefeated: boolean;
}
