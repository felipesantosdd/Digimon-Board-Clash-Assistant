import db from "./db";

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

// Funções de Effects
export function getAllEffects(): Effect[] {
  if (process.env.NODE_ENV === "production") {
    // Em produção, usar JSON
    return [];
  }

  return db
    .prepare("SELECT * FROM effects ORDER BY type, name")
    .all() as Effect[];
}

export function getEffectById(id: number): Effect | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return db.prepare("SELECT * FROM effects WHERE id = ?").get(id) as
    | Effect
    | undefined;
}

export function getEffectByCode(code: string): Effect | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return db.prepare("SELECT * FROM effects WHERE code = ?").get(code) as
    | Effect
    | undefined;
}

export function getEffectsByType(type: EffectType): Effect[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return db
    .prepare("SELECT * FROM effects WHERE type = ? ORDER BY name")
    .all(type) as Effect[];
}

export function createEffect(effect: Omit<Effect, "id">): Effect {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot create effects in production");
  }

  const stmt = db.prepare(`
    INSERT INTO effects (name, description, code, type, value)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    effect.name,
    effect.description,
    effect.code,
    effect.type,
    effect.value
  );

  return getEffectById(Number(result.lastInsertRowid))!;
}

export function updateEffect(
  id: number,
  effect: Partial<Omit<Effect, "id">>
): Effect | null {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot update effects in production");
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (effect.name !== undefined) {
    fields.push("name = ?");
    values.push(effect.name);
  }
  if (effect.description !== undefined) {
    fields.push("description = ?");
    values.push(effect.description);
  }
  if (effect.code !== undefined) {
    fields.push("code = ?");
    values.push(effect.code);
  }
  if (effect.type !== undefined) {
    fields.push("type = ?");
    values.push(effect.type);
  }
  if (effect.value !== undefined) {
    fields.push("value = ?");
    values.push(effect.value);
  }

  if (fields.length === 0) return getEffectById(id) || null;

  values.push(id);
  const stmt = db.prepare(
    `UPDATE effects SET ${fields.join(", ")} WHERE id = ?`
  );
  stmt.run(...values);

  return getEffectById(id) || null;
}

export function deleteEffect(id: number): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot delete effects in production");
  }

  db.prepare("DELETE FROM effects WHERE id = ?").run(id);
}
