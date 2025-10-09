import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Adicionando coluna dropChance à tabela items...");

try {
  // Verificar se a coluna já existe
  const tableInfo = db.prepare("PRAGMA table_info(items)").all() as any[];
  const hasDropChance = tableInfo.some(
    (column) => column.name === "dropChance"
  );

  if (hasDropChance) {
    console.log("✅ Coluna dropChance já existe!");
  } else {
    // Adicionar a coluna dropChance
    db.exec(`
      ALTER TABLE items 
      ADD COLUMN dropChance INTEGER DEFAULT 0 CHECK(dropChance >= 0 AND dropChance <= 100)
    `);
    console.log("✅ Coluna dropChance adicionada com sucesso!");

    // Atualizar itens existentes com valores padrão
    const updateStmt = db.prepare(
      "UPDATE items SET dropChance = ? WHERE id = ?"
    );

    const defaultDropChances = [
      30, // Poção de Vida (ID 1)
      20, // Super Poção (ID 2)
      10, // Poção Completa (ID 3)
      15, // Reviver (ID 4)
      25, // Chip de Força (ID 5)
      20, // Escudo Digital (ID 6)
      5, // Cristal de Evolução (ID 7)
      8, // Elixir Mágico (ID 8)
    ];

    for (let i = 0; i < defaultDropChances.length; i++) {
      updateStmt.run(defaultDropChances[i], i + 1);
    }

    console.log(
      "✅ Valores padrão de dropChance aplicados aos itens existentes!"
    );
  }

  // Verificar os itens atualizados
  const items = db.prepare("SELECT id, name, dropChance FROM items").all();
  console.log("📋 Itens com dropChance:");
  items.forEach((item: any) => {
    console.log(`  ${item.id}. ${item.name}: ${item.dropChance}%`);
  });

  db.close();
  console.log("🎉 Migração concluída com sucesso!");
} catch (error) {
  console.error("❌ Erro durante a migração:", error);
  db.close();
  process.exit(1);
}
