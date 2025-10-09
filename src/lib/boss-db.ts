import db from "./db";

export interface Boss {
  id: number;
  name: string;
  image: string;
  description: string;
  effect: string;
  dp: number;
  typeId: number;
}

export interface BossDrop {
  id: number;
  bossId: number;
  itemId: number;
  dropChance: number; // 1 a 100 (ex: 50 = 50% de chance)
}

export interface BossWithDrops extends Boss {
  drops: BossDrop[];
}

// Funções de Bosses
export function getAllBosses(): Boss[] {
  if (process.env.NODE_ENV === "production") {
    // Em produção, usar JSON
    return [];
  }

  return db.prepare("SELECT * FROM bosses ORDER BY dp").all() as Boss[];
}

export function getBossById(id: number): Boss | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return db.prepare("SELECT * FROM bosses WHERE id = ?").get(id) as
    | Boss
    | undefined;
}

export function getBossWithDrops(id: number): BossWithDrops | undefined {
  const boss = getBossById(id);
  if (!boss) return undefined;

  const drops = getBossDrops(id);
  return { ...boss, drops };
}

export function createBoss(boss: Omit<Boss, "id">): Boss {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot create bosses in production");
  }

  const stmt = db.prepare(`
    INSERT INTO bosses (name, image, description, effect, dp, typeId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    boss.name,
    boss.image,
    boss.description,
    boss.effect,
    boss.dp,
    boss.typeId
  );

  return getBossById(Number(result.lastInsertRowid))!;
}

export function updateBoss(
  id: number,
  boss: Partial<Omit<Boss, "id">>
): Boss | null {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot update bosses in production");
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (boss.name !== undefined) {
    fields.push("name = ?");
    values.push(boss.name);
  }
  if (boss.image !== undefined) {
    fields.push("image = ?");
    values.push(boss.image);
  }
  if (boss.description !== undefined) {
    fields.push("description = ?");
    values.push(boss.description);
  }
  if (boss.effect !== undefined) {
    fields.push("effect = ?");
    values.push(boss.effect);
  }
  if (boss.dp !== undefined) {
    fields.push("dp = ?");
    values.push(boss.dp);
  }
  if (boss.typeId !== undefined) {
    fields.push("typeId = ?");
    values.push(boss.typeId);
  }

  if (fields.length === 0) return getBossById(id) || null;

  values.push(id);
  const stmt = db.prepare(
    `UPDATE bosses SET ${fields.join(", ")} WHERE id = ?`
  );
  stmt.run(...values);

  return getBossById(id) || null;
}

export function deleteBoss(id: number): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot delete bosses in production");
  }

  // Deletar drops associados primeiro
  db.prepare("DELETE FROM boss_drops WHERE bossId = ?").run(id);
  // Deletar boss
  db.prepare("DELETE FROM bosses WHERE id = ?").run(id);
}

// Funções de Boss Drops
export function getBossDrops(bossId: number): BossDrop[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return db
    .prepare("SELECT * FROM boss_drops WHERE bossId = ?")
    .all(bossId) as BossDrop[];
}

export function createBossDrop(drop: Omit<BossDrop, "id">): BossDrop {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot create boss drops in production");
  }

  const stmt = db.prepare(`
    INSERT INTO boss_drops (bossId, itemId, dropChance)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(drop.bossId, drop.itemId, drop.dropChance);

  return db
    .prepare("SELECT * FROM boss_drops WHERE id = ?")
    .get(result.lastInsertRowid) as BossDrop;
}

export function updateBossDrop(
  id: number,
  drop: Partial<Omit<BossDrop, "id">>
): BossDrop | null {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot update boss drops in production");
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (drop.itemId !== undefined) {
    fields.push("itemId = ?");
    values.push(drop.itemId);
  }
  if (drop.dropChance !== undefined) {
    fields.push("dropChance = ?");
    values.push(drop.dropChance);
  }

  if (fields.length === 0) {
    return (
      (db
        .prepare("SELECT * FROM boss_drops WHERE id = ?")
        .get(id) as BossDrop) || null
    );
  }

  values.push(id);
  const stmt = db.prepare(
    `UPDATE boss_drops SET ${fields.join(", ")} WHERE id = ?`
  );
  stmt.run(...values);

  return (
    (db.prepare("SELECT * FROM boss_drops WHERE id = ?").get(id) as BossDrop) ||
    null
  );
}

export function deleteBossDrop(id: number): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot delete boss drops in production");
  }

  db.prepare("DELETE FROM boss_drops WHERE id = ?").run(id);
}

/**
 * Calcula drops para um boss derrotado
 */
export function calculateBossDrops(bossId: number): number[] {
  const drops = getBossDrops(bossId);
  const rewards: number[] = [];

  for (const drop of drops) {
    // Rolar D100 para ver se dropa
    const roll = Math.floor(Math.random() * 100) + 1;

    if (roll <= drop.dropChance) {
      // Dropou! Adicionar itemId à lista de recompensas
      rewards.push(drop.itemId);
    }
  }

  return rewards;
}
