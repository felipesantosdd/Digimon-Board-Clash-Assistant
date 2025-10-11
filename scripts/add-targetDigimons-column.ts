import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

console.log("🔄 Adicionando coluna targetDigimons à tabela items...\n");

try {
  // Verificar se a coluna já existe
  const tableInfo = db.pragma("table_info(items)");
  const columnNames = tableInfo.map((col: { name: string }) => col.name);

  if (!columnNames.includes("targetDigimons")) {
    console.log("➕ Adicionando coluna 'targetDigimons'...");
    db.exec("ALTER TABLE items ADD COLUMN targetDigimons TEXT DEFAULT '[]'");
    console.log("✅ Coluna 'targetDigimons' adicionada com sucesso!");
  } else {
    console.log("⏭️  Coluna 'targetDigimons' já existe");
  }

  console.log("\n✅ Migração concluída!");
} catch (error) {
  console.error("❌ Erro na migração:", error);
  process.exit(1);
} finally {
  db.close();
}

