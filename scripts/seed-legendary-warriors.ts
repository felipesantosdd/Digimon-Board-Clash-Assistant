import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔥 Cadastrando Guerreiros Lendários faltantes...\n");

try {
  // Guerreiros que precisam ser cadastrados
  const warriors = [
    // FOGO
    {
      name: "agunimon",
      level: 2, // Champion (Hybrid)
      typeId: 1, // Data
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    // GELO
    {
      name: "kumamon",
      level: 2, // Champion (Hybrid)
      typeId: 2, // Vaccine
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    {
      name: "korikakumon",
      level: 3, // Ultimate (Beast Spirit)
      typeId: 2, // Vaccine
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    // VENTO
    {
      name: "kazemon",
      level: 2, // Champion (Hybrid)
      typeId: 4, // Free
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    {
      name: "zephyrmon",
      level: 3, // Ultimate (Beast Spirit)
      typeId: 4, // Free
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    // TROVÃO
    {
      name: "beetlemon",
      level: 2, // Champion (Hybrid)
      typeId: 4, // Free
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    {
      name: "metalkabuterimon",
      level: 3, // Ultimate (Beast Spirit)
      typeId: 1, // Data
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    // TREVAS
    {
      name: "lowemon",
      level: 2, // Champion (Hybrid)
      typeId: 5, // Variable
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
    {
      name: "jagerlowemon",
      level: 3, // Ultimate (Beast Spirit)
      typeId: 5, // Variable
      image: "/images/digimons/fallback.svg",
      evolution: "[]",
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO digimons (name, level, typeId, image, evolution, active, boss)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  console.log("📝 Cadastrando guerreiros:\n");

  const insertedIds: number[] = [];

  warriors.forEach((warrior) => {
    const result = stmt.run(
      warrior.name,
      warrior.level,
      warrior.typeId,
      warrior.image,
      warrior.evolution,
      1, // active
      0 // boss
    );

    const insertedId = result.lastInsertRowid as number;
    insertedIds.push(insertedId);

    console.log(
      `✅ ${warrior.name.toUpperCase()} (ID: ${insertedId}, Level ${
        warrior.level
      })`
    );
  });

  console.log("\n" + "═".repeat(70));
  console.log(`✅ ${warriors.length} Guerreiros Lendários cadastrados!`);
  console.log("═".repeat(70));
  console.log("\n📋 IDs cadastrados:", insertedIds.join(", "));
  console.log("");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("\n✅ Processo concluído!");
