import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🎒 Inicializando tabela de itens...");

try {
  // Criar tabela
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      effect TEXT NOT NULL
    )
  `);
  console.log("✅ Tabela de itens criada com sucesso!");

  // Limpar dados existentes
  db.prepare("DELETE FROM items").run();

  // Inserir itens
  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect)
    VALUES (?, ?, ?, ?)
  `);

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

  console.log("📦 Populando itens...");
  for (const item of items) {
    stmt.run(item.name, item.description, item.image, item.effect);
  }

  console.log("✅ Itens adicionados com sucesso!");
  db.close();
} catch (error) {
  console.error("❌ Erro ao inicializar itens:", error);
  process.exit(1);
}
