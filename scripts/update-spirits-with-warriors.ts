import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Atualizando Espíritos com IDs dos guerreiros...\n");

try {
  // Mapeamento CORRETO: Espíritos → Guerreiros (Level 8 - Spirits)
  const mapping = [
    { itemId: 33, name: "Espírito Humano do Fogo", targetDigimons: [542] }, // Agunimon
    { itemId: 34, name: "Espírito Bestial do Fogo", targetDigimons: [85] }, // BurningGreymon
    { itemId: 35, name: "Espírito Humano da Luz", targetDigimons: [75] }, // Lobomon
    { itemId: 36, name: "Espírito Bestial da Luz", targetDigimons: [82] }, // KendoGarurumon
    { itemId: 37, name: "Espírito Humano do Gelo", targetDigimons: [543] }, // Kumamon
    { itemId: 38, name: "Espírito Bestial do Gelo", targetDigimons: [544] }, // Korikakumon
    { itemId: 39, name: "Espírito Humano do Vento", targetDigimons: [545] }, // Kazemon
    { itemId: 40, name: "Espírito Bestial do Vento", targetDigimons: [546] }, // Zephyrmon
    { itemId: 41, name: "Espírito Humano do Trovão", targetDigimons: [547] }, // Beetlemon
    { itemId: 42, name: "Espírito Bestial do Trovão", targetDigimons: [548] }, // MetalKabuterimon
    { itemId: 43, name: "Espírito Humano das Trevas", targetDigimons: [549] }, // Lowemon
    { itemId: 44, name: "Espírito Bestial das Trevas", targetDigimons: [550] }, // JagerLowemon
  ];

  console.log("📝 Atualizando espíritos:\n");

  mapping.forEach((m) => {
    db.prepare("UPDATE items SET targetDigimons = ? WHERE id = ?").run(
      JSON.stringify(m.targetDigimons),
      m.itemId
    );
    console.log(`✅ ${m.name} → IDs: [${m.targetDigimons.join(", ")}]`);
  });

  console.log("\n" + "═".repeat(70));
  console.log("✅ Todos os espíritos atualizados!");
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
