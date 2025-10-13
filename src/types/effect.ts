export type EffectType =
  | "heal"
  | "damage"
  | "buff"
  | "debuff"
  | "special"
  | "boss"
  | "evolution"
  | "movement"
  | "attack_bonus"
  | "defense_bonus";

export type StatusType = "hp" | "attack" | "defense" | "movement";

export interface Effect {
  id: number;
  name: string;
  description: string;
  code: string;
  type: EffectType;
  value: number;
  statusType?: StatusType | null; // Qual status será afetado (hp, attack, defense, movement)
}
