export type EffectType =
  | "heal"
  | "damage"
  | "buff"
  | "debuff"
  | "special"
  | "boss"
  | "evolution";

export interface Effect {
  id: number;
  name: string;
  description: string;
  code: string;
  type: EffectType;
  value: number;
}
