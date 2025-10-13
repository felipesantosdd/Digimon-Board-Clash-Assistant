import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔒 Adicionando campo 'unique' para itens únicos...\n");

try {
  // 1. Adicionar coluna 'unique' à tabela items
  db.prepare(
    `ALTER TABLE items ADD COLUMN unique_item INTEGER DEFAULT 0`
  ).run();

  console.log("✅ Coluna 'unique_item' adicionada\n");

  // 2. Marcar Armors, Spirits e Emblemas como únicos
  const uniqueItemTypes = [
    { effectId: 16, name: "Espíritos Lendários" },
    { effectId: 17, name: "Armor Eggs (DigiEggs)" },
    { effectId: 21, name: "Emblemas (Crests)" },
  ];

  for (const itemType of uniqueItemTypes) {
    const result = db
      .prepare(
        `UPDATE items 
         SET unique_item = 1 
         WHERE effectId = ?`
      )
      .run(itemType.effectId);

    console.log(
      `✅ ${result.changes} item(ns) de ${itemType.name} marcado(s) como único(s)`
    );
  }

  // 3. Verificar resultado
  const uniqueItems = db
    .prepare(
      `SELECT id, name, effectId FROM items WHERE unique_item = 1 ORDER BY effectId, name`
    )
    .all() as { id: number; name: string; effectId: number }[];

  console.log(`\n🔒 Total de ${uniqueItems.length} itens únicos:`);

  let currentEffectId = -1;
  uniqueItems.forEach((item) => {
    if (item.effectId !== currentEffectId) {
      currentEffectId = item.effectId;
      const effectName = uniqueItemTypes.find(
        (t) => t.effectId === item.effectId
      )?.name;
      console.log(`\n📦 ${effectName}:`);
    }
    console.log(`   - ${item.name} (ID: ${item.id})`);
  });

  console.log("\n🎉 Campo de itens únicos configurado com sucesso!");

  db.close();
  process.exit(0);
} catch (error: any) {
  if (error.message?.includes("duplicate column name")) {
    console.log(
      "ℹ️ Coluna 'unique_item' já existe, apenas atualizando valores...\n"
    );

    // Marcar itens como únicos
    const uniqueItemTypes = [
      { effectId: 16, name: "Espíritos Lendários" },
      { effectId: 17, name: "Armor Eggs (DigiEggs)" },
      { effectId: 21, name: "Emblemas (Crests)" },
    ];

    for (const itemType of uniqueItemTypes) {
      const result = db
        .prepare(
          `UPDATE items 
           SET unique_item = 1 
           WHERE effectId = ?`
        )
        .run(itemType.effectId);

      console.log(
        `✅ ${result.changes} item(ns) de ${itemType.name} marcado(s) como único(s)`
      );
    }

    console.log("\n🎉 Itens únicos atualizados com sucesso!");
    db.close();
    process.exit(0);
  }

  console.error("❌ Erro:", error);
  db.close();
  process.exit(1);
}
