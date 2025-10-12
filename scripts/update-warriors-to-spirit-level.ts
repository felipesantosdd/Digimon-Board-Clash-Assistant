import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Atualizando guerreiros para Level 8 (Spirits)...\n");

try {
  // IDs dos guerreiros que acabamos de cadastrar
  const warriorIds = [542, 543, 544, 545, 546, 547, 548, 549, 550];

  // Atualizar todos para level 8
  const stmt = db.prepare("UPDATE digimons SET level = 8 WHERE id = ?");

  console.log("📝 Atualizando guerreiros:\n");

  warriorIds.forEach((id) => {
    const digimon = db
      .prepare("SELECT name, level FROM digimons WHERE id = ?")
      .get(id) as { name: string; level: number } | undefined;

    if (digimon) {
      stmt.run(id);
      console.log(
        `✅ ${digimon.name.toUpperCase()} (ID: ${id}): Level ${
          digimon.level
        } → Level 8 (Spirits)`
      );
    }
  });

  console.log("\n" + "═".repeat(70));
  console.log("✅ Todos os guerreiros atualizados para Level 8 (Spirits)!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
