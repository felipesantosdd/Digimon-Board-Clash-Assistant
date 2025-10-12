import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Corrigindo Digi-Egg of Courage...\n");

try {
  // Buscar o item Digi-Egg of Courage
  const item = db
    .prepare("SELECT * FROM items WHERE name = 'Digi-Egg of Courage'")
    .get() as
    | {
        id: number;
        name: string;
        effectId: number | null;
        targetDigimons: string;
      }
    | undefined;

  if (!item) {
    console.log("⚠️  Item 'Digi-Egg of Courage' não encontrado");
    process.exit(0);
  }

  console.log("📋 Item encontrado:", item);

  // Buscar o efeito de evolução armor
  const evolutionEffect = db
    .prepare("SELECT * FROM effects WHERE code = 'evolution_armor'")
    .get() as { id: number; name: string } | undefined;

  if (!evolutionEffect) {
    console.log("❌ Efeito 'evolution_armor' não encontrado!");
    process.exit(1);
  }

  console.log("✨ Efeito encontrado:", evolutionEffect);

  // Atualizar o item
  db.prepare("UPDATE items SET effectId = ? WHERE id = ?").run(
    evolutionEffect.id,
    item.id
  );

  console.log(
    `\n✅ Digi-Egg of Courage atualizado com effectId ${evolutionEffect.id} (${evolutionEffect.name})`
  );

  // Verificar resultado
  const updatedItem = db
    .prepare("SELECT * FROM items WHERE id = ?")
    .get(item.id);
  console.log("\n📋 Item atualizado:", updatedItem);
} catch (error) {
  console.error("❌ Erro:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("\n✅ Processo concluído!");
