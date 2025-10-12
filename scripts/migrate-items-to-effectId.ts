import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Migrando itens para usar effectId ao invés de effect...\n");

try {
  // Buscar todos os itens e efeitos
  const items = db.prepare("SELECT * FROM items").all() as Array<{
    id: number;
    name: string;
    effect: string;
    effectId: number | null;
  }>;

  const effects = db.prepare("SELECT * FROM effects").all() as Array<{
    id: number;
    code: string;
    name: string;
  }>;

  console.log(`📊 Itens encontrados: ${items.length}`);
  console.log(`📊 Efeitos encontrados: ${effects.length}\n`);

  let updated = 0;

  // Mapear effect (string) para effectId
  for (const item of items) {
    if (!item.effectId && item.effect) {
      // Buscar efeito correspondente pelo código
      const matchingEffect = effects.find((e) => e.code === item.effect);

      if (matchingEffect) {
        db.prepare("UPDATE items SET effectId = ? WHERE id = ?").run(
          matchingEffect.id,
          item.id
        );
        console.log(
          `✅ [${item.id}] ${item.name}: ${item.effect} → effectId ${matchingEffect.id} (${matchingEffect.name})`
        );
        updated++;
      } else {
        console.log(
          `⚠️  [${item.id}] ${item.name}: Nenhum efeito encontrado para '${item.effect}'`
        );
      }
    } else if (item.effectId) {
      console.log(
        `ℹ️  [${item.id}] ${item.name}: Já tem effectId ${item.effectId}`
      );
    } else {
      console.log(
        `⏭️  [${item.id}] ${item.name}: Sem effect ou effectId definido`
      );
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log(`✅ ${updated} itens atualizados com effectId`);
  console.log("═".repeat(70) + "\n");
} catch (error) {
  console.error("❌ Erro na migração:", error);
  process.exit(1);
} finally {
  db.close();
}

console.log("✅ Processo concluído!");
