import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("📱 Criando sistema de Digivice...\n");

try {
  // Criar efeito de Digivice
  const existingEffect = db
    .prepare("SELECT * FROM effects WHERE code = 'digivice'")
    .get();

  let digiviceEffectId;

  if (!existingEffect) {
    console.log("📝 Criando efeito 'Digivice'...");
    const result = db
      .prepare(
        `INSERT INTO effects (name, description, code, type, value) 
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        "Digivice",
        "Dobra o ganho de XP do Digimon que o encontrou",
        "digivice",
        "special",
        0
      );
    digiviceEffectId = result.lastInsertRowid as number;
    console.log(`✅ Efeito criado (ID: ${digiviceEffectId})\n`);
  } else {
    digiviceEffectId = (existingEffect as { id: number }).id;
    console.log(
      `✅ Efeito 'Digivice' já existe (ID: ${digiviceEffectId})\n`
    );
  }

  // Verificar se o item Digivice já existe
  const existingItem = db
    .prepare("SELECT * FROM items WHERE name = 'Digivice'")
    .get();

  if (existingItem) {
    console.log("⏭️  Item 'Digivice' já existe, atualizando...");
    db.prepare("UPDATE items SET effectId = ? WHERE name = 'Digivice'").run(
      digiviceEffectId
    );
    console.log("✅ Item atualizado!");
  } else {
    console.log("📝 Criando item 'Digivice'...");
    const result = db
      .prepare(
        `INSERT INTO items (name, description, image, effect, effectId, dropChance, targetDigimons)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        "Digivice",
        "Um dispositivo especial que dobra o ganho de XP do Digimon que o encontrou. Cada Digimon só pode ter um.",
        "/images/items/fallback.svg",
        "",
        digiviceEffectId,
        15, // 15% de chance de encontrar
        "[]"
      );
    console.log(`✅ Item Digivice criado (ID: ${result.lastInsertRowid})`);
  }

  console.log("\n" + "═".repeat(70));
  console.log("✅ Sistema de Digivice configurado!");
  console.log("═".repeat(70));
  console.log("\n💡 MECÂNICA:");
  console.log("   • 15% de chance de encontrar na exploração");
  console.log("   • Não pode ser usado (efeito passivo)");
  console.log("   • Dobra XP ganho em batalhas");
  console.log("   • Cada Digimon só pode ter 1 Digivice");
  console.log("   • Fica na bag compartilhada mas rastreia o dono");
  console.log("");
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");

