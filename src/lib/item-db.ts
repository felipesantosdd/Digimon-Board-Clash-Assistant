import db from "./db";
import { Item } from "@/types/item";

// Criar tabela de itens se não existir
export function initializeItemsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      effect TEXT NOT NULL
    )
  `;

  db.exec(createTableQuery);
}

// Buscar todos os itens
export function getAllItems(): Item[] {
  const items = db.prepare("SELECT * FROM items ORDER BY name").all() as Array<
    Omit<Item, "targetDigimons" | "active"> & {
      targetDigimons: string;
      active: number;
    }
  >;

  return items.map((item) => ({
    ...item,
    targetDigimons: item.targetDigimons
      ? JSON.parse(item.targetDigimons)
      : undefined,
    active: item.active === 1,
  }));
}

// Buscar item por ID
export function getItemById(id: number): Item | undefined {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id) as
    | (Omit<Item, "targetDigimons" | "active"> & {
        targetDigimons: string;
        active: number;
      })
    | undefined;

  if (!item) return undefined;

  return {
    ...item,
    targetDigimons: item.targetDigimons
      ? JSON.parse(item.targetDigimons)
      : undefined,
    active: item.active === 1,
  };
}

// Criar novo item
export function createItem(item: Omit<Item, "id">): Item {
  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    item.name,
    item.description,
    item.image,
    item.effect,
    item.effectId || null,
    item.dropChance || 0,
    JSON.stringify(item.targetDigimons || []),
    item.active !== false ? 1 : 0 // Padrão: ativo
  );

  return {
    id: result.lastInsertRowid as number,
    ...item,
  };
}

// Atualizar item
export function updateItem(id: number, item: Partial<Omit<Item, "id">>): void {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (item.name !== undefined) {
    fields.push("name = ?");
    values.push(item.name);
  }
  if (item.description !== undefined) {
    fields.push("description = ?");
    values.push(item.description);
  }
  if (item.image !== undefined) {
    fields.push("image = ?");
    values.push(item.image);
  }
  if (item.effect !== undefined) {
    fields.push("effect = ?");
    values.push(item.effect);
  }
  if (item.effectId !== undefined) {
    fields.push("effectId = ?");
    values.push(item.effectId || null);
  }
  if (item.dropChance !== undefined) {
    fields.push("dropChance = ?");
    values.push(item.dropChance);
  }
  if (item.targetDigimons !== undefined) {
    fields.push("targetDigimons = ?");
    values.push(JSON.stringify(item.targetDigimons));
  }
  if (item.active !== undefined) {
    fields.push("active = ?");
    values.push(item.active ? 1 : 0);
  }

  if (fields.length === 0) return;

  values.push(id);

  const stmt = db.prepare(`UPDATE items SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
}

// Deletar item
export function deleteItem(id: number): void {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}

// Seed inicial de itens
export function seedItems() {
  const items = [
    {
      name: "Poção de Vida",
      description: "Restaura 1000 HP de um Digimon",
      image: "/images/items/potion.png",
      effect: "heal_1000",
    },
    {
      name: "Super Poção",
      description: "Restaura 2000 HP de um Digimon",
      image: "/images/items/super-potion.png",
      effect: "heal_2000",
    },
    {
      name: "Poção Completa",
      description: "Restaura completamente o HP de um Digimon",
      image: "/images/items/full-potion.png",
      effect: "heal_full",
    },
    {
      name: "Reviver",
      description: "Revive um Digimon derrotado com metade do HP",
      image: "/images/items/revive.png",
      effect: "revive_half",
    },
    {
      name: "Chip de Força",
      description: "Aumenta permanentemente o DP em 500",
      image: "/images/items/power-chip.png",
      effect: "boost_dp_500",
    },
    {
      name: "Escudo Digital",
      description: "Protege de um ataque neste turno",
      image: "/images/items/shield.png",
      effect: "shield_turn",
    },
    {
      name: "Cristal de Evolução",
      description: "Permite evolução imediata se disponível",
      image: "/images/items/evo-crystal.png",
      effect: "instant_evolution",
    },
    {
      name: "Elixir Mágico",
      description: "Restaura HP e remove debuffs",
      image: "/images/items/elixir.png",
      effect: "heal_cleanse",
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect)
    VALUES (?, ?, ?, ?)
  `);

  for (const item of items) {
    stmt.run(item.name, item.description, item.image, item.effect);
  }
}
