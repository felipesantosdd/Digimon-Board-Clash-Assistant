import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Atualizando guerreiros existentes para Level 8 (Spirits)...\n");

try {
  // IDs dos guerreiros que já estavam no banco
  const existingWarriors = [
    { id: 75, name: "Lobomon" },
    { id: 82, name: "KendoGarurumon" },
    { id: 85, name: "BurningGreymon" },
    { id: 86, name: "Beowolfmon" },
  ];

  const stmt = db.prepare("UPDATE digimons SET level = 8 WHERE id = ?");

  console.log("📝 Atualizando guerreiros existentes:\n");

  existingWarriors.forEach(({ id, name }) => {
    const digimon = db
      .prepare("SELECT level FROM digimons WHERE id = ?")
      .get(id) as { level: number } | undefined;

    if (digimon) {
      stmt.run(id);
      console.log(
        `✅ ${name.toUpperCase()} (ID: ${id}): Level ${digimon.level} → Level 8 (Spirits)`
      );
    }
  });

  console.log("\n" + "═".repeat(70));
  console.log("✅ Guerreiros existentes atualizados para Level 8!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");

