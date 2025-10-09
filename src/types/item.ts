export interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  effect: string; // Deprecated - use effectId
  effectId?: number; // ID do efeito na tabela effects
  dropChance?: number; // Chance de 0-100% de encontrar o item explorando
}

export interface GameItem extends Item {
  quantity: number; // Quantidade do item na bag
}

export type ItemEffect =
  | "heal_1000"
  | "heal_2000"
  | "heal_full"
  | "revive_half"
  | "boost_dp_500"
  | "shield_turn"
  | "instant_evolution"
  | "heal_cleanse";
