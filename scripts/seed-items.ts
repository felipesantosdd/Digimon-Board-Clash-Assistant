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
      effect TEXT NOT NULL,
      dropChance INTEGER DEFAULT 0 CHECK(dropChance >= 0 AND dropChance <= 100)
    )
  `);
  console.log("✅ Tabela de itens criada com sucesso!");

  // Limpar dados existentes
  db.prepare("DELETE FROM items").run();

  // Inserir itens
  const stmt = db.prepare(`
    INSERT INTO items (name, description, image, effect, dropChance)
    VALUES (?, ?, ?, ?, ?)
  `);

  const items = [
    {
      name: "Poção de Vida",
      description: "Restaura 1000 HP de um Digimon",
      image: "/images/items/potion.png",
      effect: "heal_1000",
      dropChance: 30, // 30% de chance
    },
    {
      name: "Super Poção",
      description: "Restaura 2000 HP de um Digimon",
      image: "/images/items/super-potion.png",
      effect: "heal_2000",
      dropChance: 20, // 20% de chance
    },
    {
      name: "Poção Completa",
      description: "Restaura completamente o HP de um Digimon",
      image: "/images/items/full-potion.png",
      effect: "heal_full",
      dropChance: 10, // 10% de chance
    },
    {
      name: "Reviver",
      description: "Revive um Digimon derrotado com metade do HP",
      image: "/images/items/revive.png",
      effect: "revive_half",
      dropChance: 15, // 15% de chance
    },
    {
      name: "Chip de Força",
      description: "Aumenta permanentemente o DP em 500",
      image: "/images/items/power-chip.png",
      effect: "boost_dp_500",
      dropChance: 25, // 25% de chance
    },
    {
      name: "Escudo Digital",
      description: "Protege de um ataque neste turno",
      image: "/images/items/shield.png",
      effect: "shield_turn",
      dropChance: 20, // 20% de chance
    },
    {
      name: "Cristal de Evolução",
      description: "Permite evolução imediata se disponível",
      image: "/images/items/evo-crystal.png",
      effect: "instant_evolution",
      dropChance: 5, // 5% de chance (raro)
    },
    {
      name: "Elixir Mágico",
      description: "Restaura HP e remove debuffs",
      image: "/images/items/elixir.png",
      effect: "heal_cleanse",
      dropChance: 8, // 8% de chance (raro)
    },
  ];

  console.log("📦 Populando itens...");
  for (const item of items) {
    stmt.run(
      item.name,
      item.description,
      item.image,
      item.effect,
      item.dropChance
    );
  }

  console.log("✅ Itens adicionados com sucesso!");
  db.close();
} catch (error) {
  console.error("❌ Erro ao inicializar itens:", error);
  process.exit(1);
}
